"use strict";

const http = require("http");
const path = require("path");

const REQUIRED_WEB_PACKAGES = [
  "express",
  "cors",
  "axios",
  "ws",
  "dotenv",
  "passport",
  "passport-discord",
  "express-session",
  "cookie-parser",
  "helmet",
  "compression",
  "mongoose",
  "express-rate-limit",
  "socket.io"
];

const DEFAULT_RETRY_LIMIT = Math.max(0, Number(process.env.WEB_STARTUP_RETRIES || 3));
const DEFAULT_RETRY_DELAY_MS = Math.max(250, Number(process.env.WEB_STARTUP_RETRY_DELAY_MS || 2500));

let runtime = null;
let startupPromise = null;
let startupAborted = false;

function cleanMessage(error) {
  if (!error) return "Unknown error";
  return error.message || String(error);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function startupLog(message, meta) {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[WEB] ${message}${suffix}`);
}

function startupError(message, meta) {
  const suffix = meta ? ` ${JSON.stringify(meta)}` : "";
  console.error(`[WEB] ${message}${suffix}`);
}

function validateRequiredPackages() {
  const missing = [];
  for (const dependency of REQUIRED_WEB_PACKAGES) {
    try {
      require.resolve(dependency);
    } catch {
      missing.push(dependency);
    }
  }
  return missing;
}

function corsOptions(config) {
  return {
    origin(origin, callback) {
      if (!origin || config.security.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin blocked by CORS policy"));
    },
    credentials: true
  };
}

function isUnsafePublicHost(host = "", publicUrl = "") {
  const requestHost = String(host || "").toLowerCase();
  const hostname = requestHost.split(":")[0];
  let publicHost = "";
  let publicHostname = "";
  try {
    const parsed = new URL(publicUrl);
    publicHost = parsed.host.toLowerCase();
    publicHostname = parsed.hostname.toLowerCase();
  } catch {}
  if (requestHost && (requestHost === publicHost || hostname === publicHostname)) return false;
  return (
    /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

function canonicalRedirect(config) {
  return function redirectMiddleware(req, res, next) {
    if (!config.isProduction || !config.server.publicUrl) return next();
    if (["/status", "/api/status", "/health", "/api/health", "/api/bridge"].includes(req.path)) return next();
    const requestHost = req.get("host") || "";
    const requestHostname = String(requestHost).toLowerCase().split(":")[0];
    const remoteAddress = String(req.socket.remoteAddress || "");
    const isLoopbackRequest = remoteAddress === "127.0.0.1" || remoteAddress === "::1" || remoteAddress.endsWith(":127.0.0.1");
    const publicHostname = new URL(config.server.publicUrl).hostname.toLowerCase();
    const isLoopbackHost = ["localhost", "127.0.0.1"].includes(requestHostname);
    const publicUrlIsLoopback = ["localhost", "127.0.0.1"].includes(publicHostname);
    if (isLoopbackRequest && isLoopbackHost && (!publicUrlIsLoopback || requestHostname === publicHostname)) return next();
    if (!isUnsafePublicHost(requestHost, config.server.publicUrl)) return next();
    const target = new URL(req.originalUrl || "/", config.server.publicUrl);
    return res.redirect(301, target.toString());
  };
}

function publicStatus(status) {
  const bridge = status.bridge || {};
  return {
    online: Boolean(status.online),
    latency: status.latency,
    ping: status.ping,
    uptime: status.uptime,
    servers: status.servers,
    guilds: status.guilds ?? status.servers,
    guildCount: status.guildCount ?? status.guilds ?? status.servers,
    users: status.users,
    userCount: status.userCount ?? status.users,
    channels: status.channels,
    commands: status.commands,
    clientId: status.clientId,
    shards: status.shards,
    clusters: status.clusters,
    memory: status.memory,
    cpu: status.cpu,
    sync: status.sync,
    bridge,
    bridgeState: status.bridgeState || bridge.state,
    botUsername: status.botUsername || status.username,
    botAvatar: status.botAvatar || status.avatar,
    botVerified: status.botVerified ?? status.verified
  };
}

async function validateMongo(config, mongoose, logger) {
  if (!config.database.mongoUri) {
    logger.info("Mongo Connected");
    return { ok: true, state: "ONLINE", mode: "local-json" };
  }

  if (mongoose.connection.readyState === 1) {
    logger.info("Mongo Connected");
    return { ok: true, state: "ONLINE", mode: "mongoose" };
  }

  try {
    await mongoose.connect(config.database.mongoUri, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 5000),
      maxPoolSize: Number(process.env.MONGO_POOL_SIZE || 10)
    });
    logger.info("Mongo Connected");
    return { ok: true, state: "ONLINE", mode: "mongoose" };
  } catch (error) {
    logger.error("Mongo connection failed", { error: cleanMessage(error) });
    return { ok: false, state: "OFFLINE", error: cleanMessage(error), mode: "mongoose" };
  }
}

async function listenOnce(server, port, host) {
  return new Promise((resolve, reject) => {
    function onError(error) {
      server.off("listening", onListening);
      reject(error);
    }
    function onListening() {
      server.off("error", onError);
      resolve();
    }

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port, host);
  });
}

async function listenWithRetry(context, retryLimit = DEFAULT_RETRY_LIMIT, retryDelayMs = DEFAULT_RETRY_DELAY_MS) {
  const { server, config, logger } = context;
  let attempt = 0;

  while (attempt <= retryLimit) {
    attempt += 1;
    try {
      await listenOnce(server, config.server.port, config.server.host || "0.0.0.0");
      return true;
    } catch (error) {
      logger.error(`Startup attempt ${attempt} failed`, { error: cleanMessage(error), code: error.code || null });
      if (attempt > retryLimit) return false;
      await delay(retryDelayMs);
    }
  }

  return false;
}

function printStartupReport(context, status = {}) {
  const bridge = status.bridge || context.botBridge.bridge?.() || {};
  const mongoState = context.mongo?.state || "UNKNOWN";
  const boundAddress = typeof context.server.address === "function" ? context.server.address() : null;
  const boundPort = boundAddress?.port || context.config.server.port;
  console.log("━━━━━━━━━━━━━━━━━━");
  console.log("SOEZY WEB STATUS");
  console.log("━━━━━━━━━━━━━━━━━━");
  console.log(`Web: Online`);
  console.log(`Bridge: ${bridge.state === "ONLINE" ? "Online" : bridge.state || "CONNECTING"}`);
  console.log(`Mongo: ${mongoState === "ONLINE" ? "Online" : mongoState}`);
  console.log(`Guilds: ${status.guilds ?? status.servers ?? 0}`);
  console.log(`Users: ${status.users ?? 0}`);
  console.log(`Port: ${boundPort}`);
  console.log("━━━━━━━━━━━━━━━━━━");
}

async function createRuntime() {
  const missing = validateRequiredPackages();
  if (missing.length) {
    for (const dependency of missing) startupError(`Missing dependency: ${dependency}`);
    startupError("Startup aborted");
    return { ok: false, reason: "missing_dependency", missing };
  }

  const express = require("express");
  const session = require("express-session");
  const cors = require("cors");
  const helmet = require("helmet");
  const rateLimit = require("express-rate-limit");
  const cookieParser = require("cookie-parser");
  const compression = require("compression");
  const mongoose = require("mongoose");
  const { Server } = require("socket.io");

  const config = require("./soezy/config");
  const { createLogger } = require("./soezy/logger");
  const { registerGracefulShutdown } = require("./soezy/shutdown");
  const {
    createBotBridge,
    registerDashboardRoutes,
    registerDashboardSocket
  } = require("./dashboard.js");
  const {
    csrfProtection,
    createDiscordOAuth,
    registerWebsiteRoutes
  } = require("./website.js");

  const logger = createLogger("WEB");

  try {
    config.validateConfig();
    logger.info("Environment Validated");
  } catch (error) {
    logger.error(cleanMessage(error));
    logger.error("Startup aborted");
    return { ok: false, reason: "environment", error: cleanMessage(error) };
  }

  const mongo = await validateMongo(config, mongoose, logger);
  if (!mongo.ok) {
    logger.error("Startup aborted");
    return { ok: false, reason: "mongo", error: mongo.error };
  }

  const app = express();
  const server = http.createServer(app);
  const botBridge = createBotBridge({ config, logger });
  const bridge = botBridge.bridge?.() || { state: "CONNECTING" };
  logger.info(`Bridge ${bridge.state === "ONLINE" ? "Connected" : bridge.state}`);

  const socketCors = corsOptions(config);
  const io = new Server(server, {
    cors: socketCors,
    pingTimeout: config.socket.pingTimeout,
    pingInterval: config.socket.pingInterval,
    connectTimeout: config.socket.connectTimeout
  });

  app.set("trust proxy", config.server.trustProxy);
  app.disable("x-powered-by");
  app.use(canonicalRedirect(config));

  app.use(helmet(config.security.helmet));
  app.use(cors(socketCors));
  app.use(compression());
  app.use(cookieParser(config.session.secret));
  app.use("/api", rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => res.status(429).json({ ok: false, error: "Too many requests" }),
    message: { ok: false, error: "Too many requests" }
  }));

  app.use(express.json({ limit: config.server.bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: config.server.bodyLimit }));

  const sessionMiddleware = session({
    name: config.session.name,
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    rolling: config.session.rolling,
    cookie: {
      httpOnly: true,
      sameSite: config.session.sameSite,
      secure: config.session.cookieSecure,
      maxAge: config.session.maxAgeMs
    }
  });

  app.use(sessionMiddleware);
  app.use(csrfProtection);
  io.engine.use(sessionMiddleware);

  app.get("/assets/config.js", (req, res) => {
    const publicUrl = config.server.publicUrl;
    const publicHost = new URL(publicUrl).hostname;
    res.type("application/javascript").send(`
(function () {
  var PUBLIC_URL = ${JSON.stringify(publicUrl)};
  var PUBLIC_HOST = ${JSON.stringify(publicHost)};
  function unsafeHost(hostname, port) {
    return /^\\d{1,3}(?:\\.\\d{1,3}){3}$/.test(hostname) ||
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      Boolean(port);
  }
  var displayHost = unsafeHost(window.location.hostname, window.location.port)
    ? PUBLIC_HOST
    : window.location.hostname;
  window.SOEZY_CONFIG = Object.freeze({
    publicUrl: PUBLIC_URL,
    publicHost: PUBLIC_HOST,
    displayHost: displayHost,
    apiOrigin: window.location.origin,
    socketOrigin: window.location.origin
  });
})();`);
  });

  const oauth = createDiscordOAuth({
    ...config.oauth,
    botBridge,
    logger: logger.child("auth")
  });

  registerWebsiteRoutes(app, {
    oauth,
    botBridge,
    publicDir: config.paths.publicDir,
    sessionName: config.session.name
  });
  registerDashboardRoutes(app, { botBridge, io, oauth });
  registerDashboardSocket(io, { botBridge });

  app.use(express.static(config.paths.publicDir, {
    index: false,
    etag: true,
    maxAge: config.server.staticMaxAge
  }));

  app.use("/api", (req, res) => {
    res.status(404).json({ ok: false, error: "API route not found" });
  });

  app.use((req, res) => {
    res.status(404).sendFile(path.join(config.paths.publicDir, "error.html"));
  });

  app.use((err, req, res, next) => {
    logger.error(`${req.method} ${req.originalUrl}`, { error: cleanMessage(err) });
    if (res.headersSent) return next(err);
    const status = err.status || 500;
    if (req.path.startsWith("/api/")) {
      return res.status(status).json({ ok: false, error: status === 429 ? "Too many requests" : "Internal server error" });
    }
    res.status(status).sendFile(path.join(config.paths.publicDir, "error.html"));
  });

  const context = {
    ok: true,
    app,
    server,
    io,
    botBridge,
    config,
    logger,
    mongo,
    timers: [],
    cleanup: []
  };

  async function broadcastStatus() {
    try {
      io.emit("status:update", publicStatus(await botBridge.status()));
    } catch (error) {
      const now = Date.now();
      if (!context.lastBroadcastWarningAt || now - context.lastBroadcastWarningAt > 60000) {
        context.lastBroadcastWarningAt = now;
        logger.warn("Status broadcast failed", { error: cleanMessage(error) });
      }
    }
  }

  const statusTimer = setInterval(broadcastStatus, config.bot.statusMs);
  statusTimer.unref();
  context.timers.push(statusTimer);

  const stopBridgeMonitor = botBridge.startBridgeMonitor?.(config.bot.statusMs);
  if (typeof stopBridgeMonitor === "function") context.cleanup.push(stopBridgeMonitor);

  const stopBotStatus = botBridge.onStatus?.(status => {
    io.emit("status:update", publicStatus(status));
  });

  const stopBotHealth = botBridge.onHealth?.(health => {
    io.emit("health:update", {
      ok: health?.ok !== false,
      timestamp: health?.timestamp || Date.now(),
      bot: publicStatus(health?.bot || {}),
      bridge: health?.bridge || health?.bot?.bridge || botBridge.bridge?.(),
      bridgeState: health?.bridgeState || health?.bridge?.state,
      database: health?.database || {},
      system: health?.system || {},
      websocket: health?.websocket || {}
    });
  });

  const stopBotDatabase = botBridge.onDatabase?.(() => {
    io.emit("database:update", { updatedAt: Date.now() });
    broadcastStatus();
  });

  const stopBridge = botBridge.onBridge?.(async bridgeState => {
    io.emit("bridge:update", bridgeState);
    try {
      const status = await botBridge.status();
      io.emit("status:update", publicStatus(status));
      if (bridgeState.state === "ONLINE") printStartupReport(context, status);
    } catch {}
  });

  for (const stop of [stopBotStatus, stopBotHealth, stopBotDatabase, stopBridge]) {
    if (typeof stop === "function") context.cleanup.push(stop);
  }

  server.on("error", error => {
    logger.error("Server error", { error: cleanMessage(error), code: error.code || null });
  });

  registerGracefulShutdown({
    server,
    io,
    botBridge,
    timers: context.timers,
    logger,
    timeoutMs: config.shutdown.timeoutMs
  });

  return context;
}

async function cleanupRuntime(context) {
  if (!context) return;
  for (const timer of context.timers || []) clearInterval(timer);
  for (const stop of context.cleanup || []) {
    try { stop(); } catch {}
  }
  try { context.io?.close?.(); } catch {}
  try { context.server?.close?.(); } catch {}
  try { context.botBridge?.close?.(); } catch {}
}

async function startWithRetries(options = {}) {
  const context = await createRuntime();
  if (!context.ok) {
    startupAborted = true;
    return context;
  }

  const retryLimit = options.retryLimit ?? DEFAULT_RETRY_LIMIT;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const listening = await listenWithRetry(context, retryLimit, retryDelayMs);

  if (!listening) {
    context.logger.error("Startup aborted");
    await cleanupRuntime(context);
    startupAborted = true;
    return { ok: false, reason: "listen", error: "Could not bind web server" };
  }

  runtime = context;
  startupAborted = false;
  context.logger.info(`Listening on ${context.config.server.host || "0.0.0.0"}:${context.config.server.port}`);
  context.logger.info("Started");
  context.logger.info("Dashboard Ready");

  try {
    printStartupReport(context, await context.botBridge.status());
  } catch {
    printStartupReport(context, {});
  }

  return context;
}

function startWebServer(options = {}) {
  if (runtime?.server?.listening) return Promise.resolve(runtime);
  if (startupPromise) return startupPromise;
  startupPromise = startWithRetries(options).finally(() => {
    startupPromise = null;
  });
  return startupPromise;
}

async function startWebServerSafe(options = {}) {
  try {
    return await startWebServer(options);
  } catch (error) {
    startupAborted = true;
    startupError(cleanMessage(error));
    startupError("Startup aborted");
    return { ok: false, reason: "exception", error: cleanMessage(error) };
  }
}

function getWebRuntime() {
  return runtime;
}

if (require.main === module) {
  startWebServerSafe().then(result => {
    if (!result?.ok) process.exitCode = 1;
  });
}

module.exports = {
  REQUIRED_WEB_PACKAGES,
  get app() { return runtime?.app || null; },
  get server() { return runtime?.server || null; },
  get io() { return runtime?.io || null; },
  get botBridge() { return runtime?.botBridge || null; },
  get startupAborted() { return startupAborted; },
  getWebRuntime,
  startWebServer,
  startWebServerSafe,
  validateRequiredPackages
};
