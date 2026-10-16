"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const rootDir = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(rootDir, "..", ".env") });
dotenv.config({ path: path.join(rootDir, ".env") });

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function number(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function trimSlash(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function csv(value, fallback = []) {
  const items = String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function wsFromHttp(url) {
  if (!url) return "";
  return url.replace(/^https:/i, "wss:").replace(/^http:/i, "ws:");
}

function connectableHost(value) {
  const host = String(value || "").trim();
  if (!host || host === "0.0.0.0" || host === "::") return "127.0.0.1";
  return host;
}

const env = process.env;
const isProduction = env.NODE_ENV === "production";
const port = number(env.WEB_PORT || env.PORT, 4754);
const publicUrl = trimSlash(env.PUBLIC_URL || env.WEB_PUBLIC_URL || `http://localhost:${port}`);
const requestedHost = String(env.WEB_HOST || env.HOST || "0.0.0.0").trim();
const bindHost = requestedHost.toLowerCase() === "localhost"
  ? "127.0.0.1"
  : requestedHost;
const localOrigins = [`http://localhost:${port}`, `http://127.0.0.1:${port}`];
const discordRedirectUri = trimSlash(env.DISCORD_REDIRECT_URI || `${publicUrl}/api/auth/callback`);
const redirectUris = discordRedirectUri ? [discordRedirectUri] : [];
const allowedOrigins = unique(csv(env.ALLOWED_ORIGINS, [publicUrl, ...localOrigins]));

const config = {
  env: env.NODE_ENV || "development",
  isProduction,
  paths: {
    rootDir,
    publicDir: path.join(rootDir, "public"),
    logsDir: path.join(rootDir, "logs")
  },
  server: {
    host: bindHost || "0.0.0.0",
    port,
    publicUrl,
    trustProxy: number(env.TRUST_PROXY, 1),
    bodyLimit: env.BODY_LIMIT || "1mb",
    staticMaxAge: isProduction ? "10m" : 0
  },
  database: {
    mongoUri: env.MONGO_URI || "",
    localJsonPath: env.SOEZY_DATABASE_PATH || ""
  },
  bot: {
    mode: "remote",
    apiUrl: trimSlash(env.DASHBOARD_BOT_API_URL),
    wsUrl: "",
    apiSecret: env.DASHBOARD_BOT_API_SECRET || "",
    refreshMs: number(env.BOT_REFRESH_MS, 10000),
    statusMs: number(env.BOT_STATUS_MS, 5000),
    httpTimeoutMs: number(env.BOT_HTTP_TIMEOUT_MS, 8000),
    reconnectMinMs: number(env.BOT_WS_RECONNECT_MIN_MS, 1000),
    reconnectMaxMs: number(env.BOT_WS_RECONNECT_MAX_MS, 30000),
    shards: number(env.SOEZY_SHARDS, 1),
    clusters: number(env.SOEZY_CLUSTERS, 1)
  },
  oauth: {
    clientId: env.DISCORD_CLIENT_ID || "",
    clientSecret: env.DISCORD_CLIENT_SECRET || "",
    redirectUri: discordRedirectUri,
    redirectUris,
    allowedOrigins
  },
  session: {
    name: env.SESSION_COOKIE_NAME || "soezy.sid",
    secret: env.SESSION_SECRET || "",
    rolling: true,
    maxAgeMs: number(env.SESSION_MAX_AGE_MS, 1000 * 60 * 60 * 24 * 7),
    cookieSecure: bool(env.COOKIE_SECURE, publicUrl.startsWith("https://")),
    sameSite: env.SESSION_SAME_SITE || "lax"
  },
  security: {
    allowedOrigins,
    cookieSecure: bool(env.COOKIE_SECURE, publicUrl.startsWith("https://")),
    rateLimitWindowMs: number(env.RATE_LIMIT_WINDOW_MS, 60 * 1000),
    rateLimitMax: number(env.RATE_LIMIT_MAX, 180),
    helmet: {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }
  },
  socket: {
    pingTimeout: number(env.SOCKET_PING_TIMEOUT_MS, 20000),
    pingInterval: number(env.SOCKET_PING_INTERVAL_MS, 25000),
    connectTimeout: number(env.SOCKET_CONNECT_TIMEOUT_MS, 15000)
  },
  shutdown: {
    timeoutMs: number(env.SHUTDOWN_TIMEOUT_MS, 10000)
  }
};

function validateConfig() {
  fs.mkdirSync(config.paths.logsDir, { recursive: true });

  const missing = [];
  if (!config.session.secret || config.session.secret === "CHANGE_THIS") missing.push("SESSION_SECRET");
  if (!config.oauth.clientId) missing.push("DISCORD_CLIENT_ID");
  if (!config.oauth.clientSecret) missing.push("DISCORD_CLIENT_SECRET");
  if (!config.oauth.redirectUri) missing.push("DISCORD_REDIRECT_URI");
  if (!config.bot.apiUrl) missing.push("DASHBOARD_BOT_API_URL");
  if (!config.bot.apiSecret || config.bot.apiSecret.length < 32) missing.push("DASHBOARD_BOT_API_SECRET (at least 32 characters)");
  if (missing.length) {
    throw new Error(`[WEB] Missing required config: ${missing.join(", ")}`);
  }

  return config;
}

module.exports = config;
module.exports.validateConfig = validateConfig;
