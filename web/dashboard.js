"use strict";

// ============================================================
//  dashboard.js  —  Auth · Internal Runtime API · Routes · Socket
// ============================================================
//
//  What lives here:
//    Section 1 — Auth middleware
//                isLoggedIn, requireAuth, requirePageAuth,
//                canManageGuild, requireGuildAccess
//
//    Section 2 — Command scanner
//                Reads bot/commands/** and returns metadata
//                for the /api/commands endpoint
//
//    Section 3 — Runtime service factory  (createBotBridge)
//                Internal Discord client/cache/database access,
//                guild data, config management,
//                audit events, status snapshot
//
//    Section 4 — Dashboard routes  (registerDashboardRoutes)
//                Protected pages + all /api/* endpoints
//
//    Section 5 — Socket.IO handlers  (registerDashboardSocket)
//                guild:join, config:update, real-time broadcast
//
//  Exported:
//    createBotBridge, registerDashboardRoutes,
//    registerDashboardSocket
//    + all auth helpers (used by website.js internals)
// ============================================================

const fs = require("fs");
const path = require("path");
const os = require("os");
const EventEmitter = require("events");

// ─────────────────────────────────────────────────────────────
//  Section 1: Auth middleware
// ─────────────────────────────────────────────────────────────

function isLoggedIn(request) {
  return Boolean(request.session?.user?.id);
}

function isSnowflake(value) {
  return typeof value === "string" && /^\d{15,25}$/.test(value);
}

const DISCORD_PERMISSION_ADMINISTRATOR = 0x8n;
const DISCORD_PERMISSION_MANAGE_GUILD = 0x20n;

function readDiscordPermissions(guild = {}) {
  try {
    return BigInt(guild.permissions || 0);
  } catch {
    return 0n;
  }
}

function userCanManageDiscordGuild(guild = {}) {
  const permissions = readDiscordPermissions(guild);
  return Boolean(
    guild.owner ||
    guild.isOwner ||
    (permissions & DISCORD_PERMISSION_ADMINISTRATOR) === DISCORD_PERMISSION_ADMINISTRATOR ||
    (permissions & DISCORD_PERMISSION_MANAGE_GUILD) === DISCORD_PERMISSION_MANAGE_GUILD
  );
}

function guildPermissionBadges(guild = {}) {
  const permissions = readDiscordPermissions(guild);
  const badges = [];
  if (guild.owner || guild.isOwner) badges.push("OWNER");
  if ((permissions & DISCORD_PERMISSION_ADMINISTRATOR) === DISCORD_PERMISSION_ADMINISTRATOR || guild.isAdmin) badges.push("ADMIN");
  if ((permissions & DISCORD_PERMISSION_MANAGE_GUILD) === DISCORD_PERMISSION_MANAGE_GUILD || guild.hasManageGuild) badges.push("MANAGE SERVER");
  return badges.length ? badges : ["MANAGE SERVER"];
}

function requireAuth(request, response, next) {
  if (isLoggedIn(request)) return next();
  return response.status(401).json({ ok: false, error: "Login required" });
}

function requirePageAuth(request, response, next) {
  if (isLoggedIn(request)) return next();
  return response.redirect(
    `/login?next=${encodeURIComponent(request.originalUrl || "/dashboard")}`
  );
}

function canManageGuild(request, guildId) {
  if (!isLoggedIn(request) || !isSnowflake(guildId)) return false;
  return (request.session.guilds || []).some(
    g => g.id === guildId && g.canManage === true
  );
}

function discordIconUrl(guild) {
  if (!guild?.id || !guild.icon) return null;
  const ext = String(guild.icon).startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=128`;
}

function publicSessionGuild(guild) {
  const permissions = readDiscordPermissions(guild);
  const icon = discordIconUrl(guild) || guild.iconUrl || guild.icon || null;
  const manageable = userCanManageDiscordGuild(guild) || guild.manageable === true;
  const botPresenceKnown = guild.botPresenceKnown !== false;
  const botPresent = guild.botPresent === true;
  return {
    id: guild.id,
    name: guild.name || `Server ${guild.id}`,
    icon,
    iconUrl: icon,
    owner: Boolean(guild.owner || guild.isOwner),
    isAdmin: Boolean(guild.isAdmin || ((permissions & DISCORD_PERMISSION_ADMINISTRATOR) === DISCORD_PERMISSION_ADMINISTRATOR)),
    hasManageGuild: Boolean(guild.hasManageGuild || ((permissions & DISCORD_PERMISSION_MANAGE_GUILD) === DISCORD_PERMISSION_MANAGE_GUILD)),
    permissionBadges: guildPermissionBadges(guild),
    permissions: permissions.toString(),
    manageable,
    canManage: guild.canManage === true || (manageable && botPresenceKnown && botPresent),
    canInvite: guild.canInvite === true || (manageable && botPresenceKnown && !botPresent),
    botPresent,
    botPresenceKnown,
    premium: Boolean(guild.premium)
  };
}

async function syncSessionBotPresence(session, botBridge) {
  const source = Array.isArray(session.guilds) ? session.guilds : [];
  let botGuildIds = null;
  if (botBridge.bridge?.()?.state === BRIDGE_STATES.ONLINE) {
    try { botGuildIds = await botBridge.botGuildIds(); } catch {}
  }

  const synced = source.map(guild => {
    const permissions = readDiscordPermissions(guild);
    const userCanManage = userCanManageDiscordGuild(guild) || guild.manageable === true || guild.canManage === true || guild.canInvite === true;
    const botPresent = botGuildIds ? botGuildIds.has(guild.id) : (guild.botPresent === true ? true : null);
    return {
      ...guild,
      permissions: permissions.toString(),
      isOwner: Boolean(guild.owner || guild.isOwner),
      isAdmin: (permissions & DISCORD_PERMISSION_ADMINISTRATOR) === DISCORD_PERMISSION_ADMINISTRATOR || guild.isAdmin === true,
      hasManageGuild: (permissions & DISCORD_PERMISSION_MANAGE_GUILD) === DISCORD_PERMISSION_MANAGE_GUILD || guild.hasManageGuild === true,
      manageable: Boolean(userCanManage),
      botPresenceKnown: botGuildIds !== null,
      botPresent,
      canManage: Boolean(userCanManage && botPresent === true),
      canInvite: Boolean(userCanManage && botPresent === false)
    };
  }).filter(guild => guild.manageable);

  session.guilds = synced;
  if (typeof session.save === "function") {
    await new Promise(resolve => session.save(() => resolve()));
  }
  return synced;
}

function requireGuildAccess(request, response, next) {
  const guildId =
    request.params.guildId ||
    request.params.id ||
    request.body?.guildId;
  if (canManageGuild(request, guildId)) return next();
  return response.status(403).json({ ok: false, error: "You do not have access to this server" });
}

// ─────────────────────────────────────────────────────────────
//  Section 2: Command scanner
// ─────────────────────────────────────────────────────────────

const COMMAND_CATEGORIES = [
  "economy", "fun", "moderation", "music", "owner", "utility", "config"
];

function slashDataToJson(data) {
  if (!data) return {};
  if (typeof data.toJSON === "function") return data.toJSON();
  return data;
}

function optionUsage(options = []) {
  if (!Array.isArray(options) || !options.length) return "";
  return options
    .map(opt => (opt.required ? `<${opt.name || "option"}>` : `[${opt.name || "option"}]`))
    .join(" ");
}

function normalizeCommand(command, category, filePath, botDir) {
  const slash = slashDataToJson(command.data);
  const name = command.name || slash.name || path.basename(filePath, ".js");
  const aliases = command.aliases || command.alias || [];
  const suffix = slash.name && optionUsage(slash.options) ? ` ${optionUsage(slash.options)}` : "";
  return {
    name,
    description: command.description || slash.description || "No description provided.",
    aliases: Array.isArray(aliases) ? aliases : [aliases].filter(Boolean),
    usage: command.usage || (slash.name ? `/${slash.name}${suffix}` : name),
    category: command.category || category,
    premium: Boolean(command.premium || command.premiumOnly || command.isPremium),
    owner: Boolean(command.owner || command.ownerOnly || command.devOnly || category === "owner"),
    file: path.relative(botDir, filePath).replace(/\\/g, "/")
  };
}

function loadCommandFile(filePath) {
  delete require.cache[require.resolve(filePath)];
  const exported = require(filePath);
  return Array.isArray(exported) ? exported : [exported];
}

function scanCommands(botDir) {
  const commandsDir = path.join(botDir, "commands");
  const commands = [];
  const errors = [];

  for (const category of COMMAND_CATEGORIES) {
    const categoryDir = path.join(commandsDir, category);
    if (!fs.existsSync(categoryDir)) continue;
    for (const fileName of fs.readdirSync(categoryDir).filter(f => f.endsWith(".js")).sort()) {
      const filePath = path.join(categoryDir, fileName);
      try {
        for (const command of loadCommandFile(filePath)) {
          if (command && typeof command === "object") {
            commands.push(normalizeCommand(command, category, filePath, botDir));
          }
        }
      } catch (err) {
        errors.push({
          file: path.relative(botDir, filePath).replace(/\\/g, "/"),
          error: err.message
        });
      }
    }
  }

  const categories = [...new Set(commands.map(c => c.category))]
    .sort()
    .map(cat => ({
      id: cat,
      name: cat.replace(/(^|[-_])\w/g, m => m.replace(/[-_]/, "").toUpperCase()),
      count: commands.filter(c => c.category === cat).length
    }));

  commands.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return { categories, commands, errors };
}

// ─────────────────────────────────────────────────────────────
//  Section 3: Internal runtime service
//
//  The website now runs inside the bot process and reads the live
//  Discord client, guild cache, and database directly.
// ─────────────────────────────────────────────────────────────

// ── Local JSON helpers (used in LOCAL mode) ──────────────────

function readJson(filePath, fallback = {}) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return raw.trim() ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonAtomic(filePath, data) {
  const tmpPath = `${filePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmpPath, filePath);
}

// ── Prototype-pollution guard ─────────────────────────────────

function isDangerousKey(key) {
  return key === "__proto__" || key === "prototype" || key === "constructor";
}

function setNested(source, dottedPath, value) {
  const parts = String(dottedPath).split(".");
  let cursor = source;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (isDangerousKey(part)) return false;
    if (!cursor[part] || typeof cursor[part] !== "object" || Array.isArray(cursor[part])) {
      cursor[part] = {};
    }
    cursor = cursor[part];
  }
  const last = parts[parts.length - 1];
  if (isDangerousKey(last)) return false;
  cursor[last] = value;
  return true;
}

// ── Value sanitiser ───────────────────────────────────────────

function cleanValue(value) {
  if (typeof value === "string") return value.replace(/\0/g, "").slice(0, 1200).trim();
  if (typeof value === "number") return Math.max(0, Math.min(100000, value));
  if (typeof value === "boolean" || value === null) return value;
  if (Array.isArray(value)) {
    return [...new Set(value
      .map(item => String(item || "").replace(/[^\w:./-]/g, "").slice(0, 128).trim())
      .filter(Boolean))]
      .slice(0, 100);
  }
  return undefined;
}

// ── Allowlist of settable config paths ───────────────────────


const { createBotBridge, BRIDGE_STATES } = require("./remoteBridge");
function registerDashboardRoutes(app, { botBridge, io, oauth }) {
  const PUBLIC_DIR = path.join(__dirname, "public");

  function publicStatusPayload(status = {}) {
    return {
      ok: status.ok !== false,
      online: Boolean(status.online),
      servers: status.servers,
      guilds: status.servers,
      guildCount: status.guildCount ?? status.servers,
      users: status.users,
      userCount: status.userCount ?? status.users,
      channels: status.channels,
      commands: status.commands,
      latency: status.latency,
      ping: status.ping,
      uptime: status.uptime,
      shards: status.shards,
      clusters: status.clusters,
      memory: status.memory,
      cpu: status.cpu,
      sync: status.sync,
      bridge: status.bridge,
      bridgeState: status.bridgeState || status.bridge?.state,
      clientId: status.clientId,
      botUsername: status.botUsername || status.username,
      botAvatar: status.botAvatar || status.avatar,
      botVerified: status.botVerified ?? status.verified
    };
  }

  async function sendHealth(req, res, next) {
    try { res.json(await botBridge.health()); }
    catch (err) { next(err); }
  }

  async function sendBridge(req, res, next) {
    try {
      const [status, bridge] = await Promise.all([
        botBridge.status(),
        Promise.resolve(typeof botBridge.bridge === "function" ? botBridge.bridge() : {})
      ]);
      res.json({
        ok: bridge.state === BRIDGE_STATES.ONLINE,
        state: bridge.state || (status.online ? BRIDGE_STATES.ONLINE : BRIDGE_STATES.CONNECTING),
        bridgeState: bridge.state || (status.online ? BRIDGE_STATES.ONLINE : BRIDGE_STATES.CONNECTING),
        bridge,
        botOnline: Boolean(status.online),
        guilds: status.guilds ?? status.servers ?? 0,
        guildCount: status.guildCount ?? status.guilds ?? status.servers ?? 0,
        users: status.users ?? 0,
        userCount: status.userCount ?? status.users ?? 0,
        commands: status.commands ?? 0,
        uptime: status.uptime ?? null,
        latency: status.latency ?? status.ping ?? null,
        ping: status.ping ?? status.latency ?? null
      });
    } catch (err) { next(err); }
  }

  app.get("/health", sendHealth);
  app.get("/api/health", sendHealth);
  app.get("/api/bridge", sendBridge);

  app.get("/dashboard", requirePageAuth, (req, res) => res.sendFile(path.join(PUBLIC_DIR, "dashboard-home.html")));

  app.get(
    ["/dashboard/:guildId", "/dashboard/:guildId/:panel", "/dashboard/guild/:guildId", "/dashboard/guild/:guildId/:panel", "/dashboard.html"],
    requirePageAuth,
    (req, res) => res.sendFile(path.join(PUBLIC_DIR, "dashboard.html"))
  );

  app.get("/api/status", async (req, res, next) => {
    try { res.json({ ok: true, ...(await botBridge.status()) }); }
    catch (err) { next(err); }
  });

  app.get("/api/stats", async (req, res, next) => {
    try { res.json(publicStatusPayload(await botBridge.status())); }
    catch (err) { next(err); }
  });

  app.get("/api/user", (req, res) => {
    res.json({
      ok: true,
      user: req.session?.user || null,
      authenticated: Boolean(req.session?.user?.id),
      tokenExpiresAt: req.session?.tokenExpiresAt || null,
      guilds: Array.isArray(req.session?.guilds) ? req.session.guilds.length : 0
    });
  });

  app.get("/api/modules", async (req, res, next) => {
    try {
      const guildId = String(req.query.guildId || "");
      const securityAccess = guildId ? await botBridge.canManageSecurity(guildId, req.session?.user?.id) : false;
      if (guildId && !canManageGuild(req, guildId) && !securityAccess) {
        return res.status(403).json({ ok: false, error: "You do not have access to this server" });
      }
      const config = guildId ? await botBridge.safeConfig(guildId, req.session?.user?.id) : null;
      const modules = DASHBOARD_MODULES.map(module => ({
        ...module,
        enabled: config ? Boolean(module.path.split(".").reduce((current, part) => current?.[part], config)) : null
      }));
      res.json({ ok: true, modules });
    } catch (err) { next(err); }
  });

  app.get("/api/commands", async (req, res, next) => {
    try { res.json({ ok: true, ...(await botBridge.scanBotCommands()) }); }
    catch (err) { next(err); }
  });

  app.get("/api/guilds", requireAuth, async (req, res, next) => {
    try {
      if (req.session.accessToken && typeof oauth?.refreshGuilds === "function") {
        try {
          const refreshed = await oauth.refreshGuilds(req.session.accessToken);
          if (Array.isArray(refreshed)) {
            req.session.guilds = refreshed;
          }
        } catch (refreshError) {
          if (req.session.refreshToken && typeof oauth?.refreshAccessToken === "function") {
            const token = await oauth.refreshAccessToken(req.session.refreshToken);
            req.session.accessToken = token.access_token;
            req.session.refreshToken = token.refresh_token || req.session.refreshToken;
            req.session.tokenExpiresAt = Date.now() + Number(token.expires_in || 0) * 1000;
            const refreshed = await oauth.refreshGuilds(req.session.accessToken);
            if (Array.isArray(refreshed)) req.session.guilds = refreshed;
          } else if (!Array.isArray(req.session.guilds)) {
            throw refreshError;
          }
        }
      }
      await syncSessionBotPresence(req.session, botBridge);
      const allGuilds = (req.session.guilds || [])
        .filter(guild => guild.manageable !== false)
        .map(publicSessionGuild);
      let guilds = [];
      if (botBridge.bridge?.()?.state === BRIDGE_STATES.ONLINE) {
        try { guilds = await botBridge.guildsForSession(req.session); }
        catch { /* Keep OAuth-managed servers available if the bridge request fails. */ }
      }
      res.json({
        ok: true,
        guilds: Array.isArray(guilds) ? guilds : [],
        allGuilds,
        botPresenceKnown: allGuilds.every(guild => guild.botPresenceKnown),
        bridgeState: botBridge.bridge?.()?.state || BRIDGE_STATES.OFFLINE,
        summary: {
          total: allGuilds.length,
          owned: allGuilds.filter(guild => guild.owner).length,
          withBot: allGuilds.filter(guild => guild.botPresent).length,
          manageable: allGuilds.length
        }
      });
    }
    catch (err) { next(err); }
  });

  app.get("/api/guilds/:guildId", requireAuth, async (req, res, next) => {
    try {
      const guildId = req.params.guildId;
      const securityAccess = await botBridge.canManageSecurity(guildId, req.session?.user?.id);
      if (!canManageGuild(req, guildId) && !securityAccess) {
        return res.status(403).json({ ok: false, error: "You do not have access to this server." });
      }
      res.json({
        ok: true,
        guild: await botBridge.publicGuild(guildId),
        config: await botBridge.safeConfig(guildId, req.session?.user?.id)
      });
    } catch (err) { next(err); }
  });

  app.get("/api/guilds/:guildId/audit", requireAuth, async (req, res, next) => {
    try {
      const guildId = req.params.guildId;
      const securityAccess = await botBridge.canManageSecurity(guildId, req.session?.user?.id);
      if (!canManageGuild(req, guildId) && !securityAccess) return res.status(403).json({ ok: false, error: "You do not have access to this server." });
      res.json({ ok: true, events: await botBridge.auditEvents(guildId) });
    }
    catch (err) { next(err); }
  });

  app.post("/api/config/update", requireAuth, async (req, res, next) => {
    try {
      const guildId = req.body?.guildId;
      const updates =
        req.body?.updates ||
        (req.body?.path ? { [req.body.path]: req.body.value } : {});
      if (!isSnowflake(guildId)) return res.status(400).json({ ok: false, error: "Invalid server ID." });
      const paths = Object.keys(updates || {});
      const protectedOnly = paths.length > 0 && paths.every(path => botBridge.isProtectedConfigPath(path));
      const securityAccess = await botBridge.canManageSecurity(guildId, req.session?.user?.id);
      if ((!canManageGuild(req, guildId) && !(protectedOnly && securityAccess)) || (paths.some(path => botBridge.isProtectedConfigPath(path)) && !securityAccess)) {
        return res.status(403).json({ ok: false, error: "Only the configured bot owner or an authorized ExtraOwner can update protected settings." });
      }
      const payload = await botBridge.updateConfig(guildId, updates, req.session?.user?.id);
      if (!paths.some(path => botBridge.isProtectedConfigPath(path))) {
        io.to(`guild:${guildId}`).emit("config:update", { ...payload, config: await botBridge.safeConfig(guildId) });
      }
      res.json({ ok: true, ...payload });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ ok: false, error: err.message });
      next(err);
    }
  });
}

// ─────────────────────────────────────────────────────────────
//  Section 5: Socket.IO handlers
// ─────────────────────────────────────────────────────────────

function registerDashboardSocket(io, { botBridge }) {
  io.on("connection", socket => {
    const user = socket.request.session?.user || null;

    socket.emit("hello", {
      user,
      status: { online: true, latency: 0 },
      bridge: typeof botBridge.bridge === "function" ? botBridge.bridge() : null
    });

    socket.on("guild:join", async (guildId, ack) => {
      try {
        const securityAccess = user ? await botBridge.canManageSecurity(guildId, user.id) : false;
        if (!user || (!canManageGuild(socket.request, guildId) && !securityAccess)) {
          if (typeof ack === "function") ack({ ok: false, error: "Forbidden" });
          return;
        }
        socket.join(`guild:${guildId}`);
        if (typeof ack === "function") {
          ack({
            ok: true,
            guild: await botBridge.publicGuild(guildId),
            config: await botBridge.safeConfig(guildId, user.id)
          });
        }
      } catch (err) {
        if (typeof ack === "function") ack({ ok: false, error: err.message });
      }
    });

    socket.on("config:update", async (message, ack) => {
      try {
        const guildId = message?.guildId;
        const cfgPath = message?.path;
        const clean = botBridge.cleanValue(message?.value);
        const securityAccess = user ? await botBridge.canManageSecurity(guildId, user.id) : false;

        if (
          !user ||
          (!canManageGuild(socket.request, guildId) && !botBridge.isProtectedConfigPath(cfgPath)) ||
          (botBridge.isProtectedConfigPath(cfgPath) && !securityAccess) ||
          !botBridge.allowedConfigPaths.has(cfgPath) ||
          clean === undefined
        ) {
          if (typeof ack === "function") ack({ ok: false, error: "Rejected update" });
          return;
        }

        const payload = await botBridge.updateConfig(guildId, { [cfgPath]: clean }, user.id);
        if (!botBridge.isProtectedConfigPath(cfgPath)) {
          socket.to(`guild:${guildId}`).emit("config:update", { ...payload, config: await botBridge.safeConfig(guildId) });
        }
        if (typeof ack === "function") ack({ ok: true, ...payload });
      } catch (err) {
        if (typeof ack === "function") ack({ ok: false, error: err.message });
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────

module.exports = {
  createBotBridge,
  registerDashboardRoutes,
  registerDashboardSocket,
  canManageGuild,
  isLoggedIn,
  isSnowflake,
  requireAuth,
  requireGuildAccess,
  requirePageAuth
};
