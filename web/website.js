"use strict";

// ============================================================
//  website.js  —  CSRF · Discord OAuth · Auth · Pages · API
// ============================================================
//
//  What lives here:
//    Section 1 — CSRF protection
//                ensureCsrfToken, csrfProtection middleware
//
//    Section 2 — Discord OAuth2 factory  (createDiscordOAuth)
//                authUrl builder, token exchange,
//                guild permission filtering
//
//    Section 3 — Auth helper (inline — avoids circular deps)
//                isLoggedIn, requireAuth
//
//    Section 4 — Website routes  (registerWebsiteRoutes)
//                Public pages (/, /login, /docs, /premium)
//                Auth flow    (/api/auth/*)
//                Public APIs  (/status)
//
//  Exported:
//    csrfProtection    — consumed by server.js as global middleware
//    ensureCsrfToken   — called by auth session endpoint
//    createDiscordOAuth — instantiated in server.js
//    registerWebsiteRoutes — called by server.js
// ============================================================

const crypto = require("crypto");
const path = require("path");

const DISCORD_PERMISSION_ADMINISTRATOR = 0x8n;
const DISCORD_PERMISSION_MANAGE_GUILD = 0x20n;

function safeReturnPath(value, fallback = "") {
  const raw = String(value || "").trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return fallback;
  if (/^\/(?:api\/auth|logout)\b/i.test(raw)) return fallback;
  return raw.slice(0, 512);
}

function defaultDiscordAvatar(user = {}) {
  try {
    if (user.discriminator && user.discriminator !== "0") {
      return `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 5}.png`;
    }
    if (user.id) {
      const index = Number((BigInt(user.id) >> 22n) % 6n);
      return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
    }
  } catch {}
  return "https://cdn.discordapp.com/embed/avatars/0.png";
}

function discordUserAvatarUrl(user = {}, size = 128) {
  if (!user?.id || !user.avatar) return defaultDiscordAvatar(user);
  const ext = String(user.avatar).startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=${size}`;
}

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
    guild.owner === true ||
    (permissions & DISCORD_PERMISSION_ADMINISTRATOR) === DISCORD_PERMISSION_ADMINISTRATOR ||
    (permissions & DISCORD_PERMISSION_MANAGE_GUILD) === DISCORD_PERMISSION_MANAGE_GUILD
  );
}

// ─────────────────────────────────────────────────────────────
//  Section 1: CSRF protection
//  Generates a per-session token on first GET request and
//  validates it on all state-mutating requests.
//  Applied globally in server.js BEFORE route mounting.
// ─────────────────────────────────────────────────────────────

/**
 * Lazily create and return the session's CSRF token.
 * Frontend reads it via GET /api/auth/session and sends it
 * back as the X-CSRF-Token header on POST/PUT/PATCH/DELETE.
 */
function ensureCsrfToken(request) {
  if (!request.session.csrfToken) {
    request.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  return request.session.csrfToken;
}

/**
 * Express middleware — enforce CSRF on state-mutating verbs.
 * GETs and HEAD requests are always passed through.
 */
function csrfProtection(request, response, next) {
  ensureCsrfToken(request);
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) return next();
  const token = request.get("x-csrf-token") || request.body?._csrf;
  if (token && token === request.session.csrfToken) return next();
  return response.status(403).json({ ok: false, error: "Invalid CSRF token" });
}

// ─────────────────────────────────────────────────────────────
//  Section 2: Discord OAuth2 factory
//  Returns { authUrl, exchangeCode }.
//  Instantiated once in server.js and shared with routes.
// ─────────────────────────────────────────────────────────────

/**
 * Build a Discord OAuth2 client.
 *
 * @param {object} opts
 * @param {string} opts.clientId
 * @param {string} opts.clientSecret
 * @param {string} opts.redirectUri
 * @param {object} opts.botBridge   — needed to resolve bot-present guilds
 */
function createDiscordOAuth({ clientId, clientSecret, redirectUri, botBridge }) {
  const configuredRedirectUri = String(redirectUri || "").trim();

  // ── URL builder ────────────────────────────────────────────

  /**
   * Build the Discord authorize URL and store a CSRF state value
   * in the session to prevent OAuth state-fixation attacks.
   */
  function authUrl(request) {
    const session = request.session || request;
    const state = crypto.randomBytes(16).toString("hex");
    session.oauthState = state;
    session.oauthRedirectUri = configuredRedirectUri;
    return (
      "https://discord.com/oauth2/authorize?" +
      new URLSearchParams({
        client_id: clientId,
        redirect_uri: configuredRedirectUri,
        response_type: "code",
        scope: "identify guilds",
        prompt: "consent",
        state
      }).toString()
    );
  }

  // ── Authenticated Discord REST fetch (OAuth Bearer) ────────

  async function discordFetch(pathname, token) {
    const res = await fetch(`https://discord.com/api/v10${pathname}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) throw new Error(`Discord API ${res.status}`);
    return res.json();
  }

  async function resolveBotGuildIds() {
    if (typeof botBridge.botGuildIds === "function") {
      try {
        const ids = await botBridge.botGuildIds();
        if (ids?.size) return ids;
      } catch {}
    }
    return new Set(Object.keys(botBridge.loadDatabase?.()?.guilds || {}));
  }

  async function manageableGuilds(discordGuilds) {
    const botGuildIds = await resolveBotGuildIds();
    return discordGuilds
      .map(guild => {
        const permissions = readDiscordPermissions(guild);
        const userCanManage = userCanManageDiscordGuild(guild);
        const botPresent = botGuildIds.has(guild.id);
        return {
          ...guild,
          permissions: permissions.toString(),
          isOwner: Boolean(guild.owner),
          isAdmin: (permissions & DISCORD_PERMISSION_ADMINISTRATOR) === DISCORD_PERMISSION_ADMINISTRATOR,
          hasManageGuild: (permissions & DISCORD_PERMISSION_MANAGE_GUILD) === DISCORD_PERMISSION_MANAGE_GUILD,
          manageable: userCanManage,
          canManage: userCanManage && botPresent,
          canInvite: userCanManage && !botPresent,
          botPresent
        };
      })
      .filter(guild => guild.manageable);
  }

  async function refreshGuilds(accessToken) {
    const discordGuilds = await discordFetch("/users/@me/guilds?with_counts=true", accessToken);
    return manageableGuilds(discordGuilds);
  }

  async function refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("Missing refresh token");
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10000),
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: String(refreshToken)
      })
    });
    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "");
      throw new Error(`Token refresh failed: ${tokenRes.status} ${errText}`);
    }
    const token = await tokenRes.json();
    if (token.error) throw new Error(`Discord OAuth error: ${token.error}`);
    return token;
  }

  function inviteUrl(inviteClientId = "", guildId = "") {
    const id = String(inviteClientId || clientId || "").trim();
    if (!id) return "";
    const params = new URLSearchParams({
      client_id: id,
      permissions: "8",
      integration_type: "0",
      scope: "bot applications.commands"
    });
    if (/^\d{15,25}$/.test(String(guildId || ""))) {
      params.set("guild_id", String(guildId));
      params.set("disable_guild_select", "true");
    }
    return "https://discord.com/oauth2/authorize?" + params.toString();
  }

  // ── Authorization-code exchange ────────────────────────────

  /**
   * Exchange an authorization code for tokens, then fetch the
   * user's profile and guild list. Returns guilds where the user
   * owns the server, has administrator, or has manage server.
   * Bot presence is attached separately as botPresent/canManage.
   */
  async function exchangeCode(code, callbackUri = configuredRedirectUri) {
    const tokenRedirectUri = String(callbackUri || configuredRedirectUri).trim();
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10000),
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: tokenRedirectUri
      })
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text().catch(() => "");
      throw new Error(`Token exchange failed: ${tokenRes.status} ${errText}`);
    }

    const token = await tokenRes.json();
    if (token.error) throw new Error(`Discord OAuth error: ${token.error}`);

    // Fetch user profile and guild list in parallel
    const [user, discordGuilds] = await Promise.all([
      discordFetch("/users/@me", token.access_token),
      discordFetch("/users/@me/guilds?with_counts=true", token.access_token)
    ]);

    const guilds = await manageableGuilds(discordGuilds);

    return { token, user, guilds };
  }

  return { authUrl, exchangeCode, refreshGuilds, refreshAccessToken, inviteUrl };
}

// ─────────────────────────────────────────────────────────────
//  Section 3: Auth helper (inline)
//  Avoids a circular import with dashboard.js.
//  Only the minimal set needed for website routes.
// ─────────────────────────────────────────────────────────────

function isLoggedIn(request) {
  return Boolean(request.session?.user?.id);
}

function requireAuth(request, response, next) {
  if (isLoggedIn(request)) return next();
  return response.status(401).json({ ok: false, error: "Login required" });
}

// ─────────────────────────────────────────────────────────────
//  Section 4: Website routes
//  Public-facing pages, auth endpoints, OAuth flow,
//  and the public /status API.
//  Registered by server.js via registerWebsiteRoutes().
// ─────────────────────────────────────────────────────────────

function registerWebsiteRoutes(app, { oauth, botBridge, publicDir, sessionName = "soezy.sid" }) {

  const sendPage = (res, fileName) => res.sendFile(path.join(publicDir, fileName));

  // ── Public pages ───────────────────────────────────────────

  app.get("/", (req, res) => sendPage(res, "index.html"));
  app.get("/docs", (req, res) => sendPage(res, "docs.html"));
  app.get("/premium", (req, res) => sendPage(res, "premium.html"));
  app.get("/status-page", (req, res) => sendPage(res, "status.html"));
  app.get(["/401", "/403", "/404", "/429", "/500"], (req, res) => {
    const status = Number(String(req.path).slice(1)) || 500;
    res.status(status).sendFile(path.join(publicDir, "error.html"));
  });
  app.get("/invite", async (req, res) => {
    let liveClientId = "";
    try {
      const status = await botBridge.status();
      liveClientId = status?.clientId || "";
    } catch {}
    const url = oauth.inviteUrl?.(liveClientId, req.query.guild_id);
    if (!url) return res.redirect("/500?reason=invite");
    return res.redirect(url);
  });

  // Redirect already-logged-in users away from /login
  app.get("/login", (req, res) => {
    const nextPath = safeReturnPath(req.query.next, "");
    if (nextPath) req.session.returnTo = nextPath;
    if (req.session?.user) return res.redirect(nextPath || "/dashboard");
    sendPage(res, "login.html");
  });

  // ── GET /status — public health check (no auth) ───────────

  app.get("/status", async (req, res, next) => {
    try {
      const h = typeof botBridge.health === "function"
        ? await botBridge.health()
        : { ok: true, bot: await botBridge.status() };
      const s = h.bot || {};
      res.json({
        ok: h.ok !== false,
        online: Boolean(s.online),
        uptime: s.uptime,
        servers: s.servers,
        users: s.users,
        commands: s.commands,
        database: h.database?.ok !== false,
        system: h.system?.online !== false,
        websocket: Boolean(h.websocket?.connected)
      });
    } catch (err) { next(err); }
  });

  // ── GET /api/auth/session ─────────────────────────────────
  //    Returns current user + a fresh CSRF token.
  //    Called by the dashboard JS on boot.

  app.get("/api/auth/session", (req, res) => {
    res.json({
      ok: true,
      user: req.session?.user || null,
      csrfToken: ensureCsrfToken(req),
      tokenExpiresAt: req.session?.tokenExpiresAt || null
    });
  });

  // ── GET /api/auth/discord — redirect to Discord ───────────

  app.get("/api/auth/discord", (req, res) => {
    const nextPath = safeReturnPath(req.query.next || req.session?.returnTo, "");
    if (nextPath) req.session.returnTo = nextPath;
    if (req.session?.user) return res.redirect(nextPath || "/dashboard");
    const url = oauth.authUrl(req);
    req.session.save(err => {
      if (err) return res.redirect("/login?error=session_failed");
      res.redirect(url);
    });
  });

  // ── GET /api/auth/callback — OAuth callback ───────────────
  //    Validates state, exchanges code, regenerates session
  //    (session fixation protection), then redirects.

  app.get("/api/auth/callback", async (req, res) => {
    try {
      const { code, state, error: oauthError } = req.query;

      // Discord returned an error (e.g. user denied access)
      if (oauthError) {
        console.warn("[AUTH] Discord returned error:", oauthError);
        return res.redirect(`/login?error=${encodeURIComponent(String(oauthError))}`);
      }

      // State mismatch — possible CSRF
      if (!code || state !== req.session.oauthState) {
        console.warn("[AUTH] State mismatch or missing code");
        return res.redirect("/login?error=oauth_state");
      }

      const returnTo = safeReturnPath(req.session.returnTo, "/dashboard") || "/dashboard";
      const result = await oauth.exchangeCode(code, req.session.oauthRedirectUri);

      // Regenerate session ID to prevent session fixation
      req.session.regenerate(err => {
        if (err) {
          console.error("[AUTH] Session regeneration failed:", err);
          return res.redirect("/login?error=session_failed");
        }

        // Populate the new session
        req.session.accessToken = result.token.access_token;
        req.session.refreshToken = result.token.refresh_token;
        req.session.tokenExpiresAt = Date.now() + Number(result.token.expires_in || 0) * 1000;
        req.session.user = {
          id: result.user.id,
          username: result.user.global_name || result.user.username,
          avatar: discordUserAvatarUrl(result.user)
        };
        req.session.guilds = result.guilds;
        ensureCsrfToken(req);

        req.session.save(saveErr => {
          if (saveErr) {
            console.error("[AUTH] Session save failed:", saveErr);
            return res.redirect("/login?error=session_failed");
          }
          res.redirect(returnTo);
        });
      });
    } catch (err) {
      console.error("[AUTH] OAuth callback failed:", err);
      res.redirect("/login?error=oauth_failed");
    }
  });

  // ── POST /api/auth/logout — fetch-based logout ────────────
  //    Called by the dashboard JS with the CSRF token set.

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy(err => {
      if (err) return res.status(500).json({ ok: false, error: "Logout failed" });
      res.clearCookie(sessionName);
      res.json({ ok: true });
    });
  });

  // ── GET /logout — direct browser navigation logout ────────

  app.get("/logout", (req, res) => {
    req.session.destroy(() => {
      res.clearCookie(sessionName);
      res.redirect("/");
    });
  });
}

// ─────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────

module.exports = {
  // CSRF (applied as global middleware in server.js)
  csrfProtection,
  ensureCsrfToken,
  // OAuth factory (instantiated in server.js)
  createDiscordOAuth,
  // Route registration (called by server.js)
  registerWebsiteRoutes
};
