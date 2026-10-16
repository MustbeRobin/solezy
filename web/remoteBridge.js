"use strict";
const { EventEmitter } = require("node:events");
const BRIDGE_STATES = { ONLINE: "ONLINE", CONNECTING: "CONNECTING", RECONNECTING: "RECONNECTING", OFFLINE: "OFFLINE" };
const protectedPath = path => /^(antinuke|automod|antilink|antibot|antiRaid|wallSystem|security|accountAge|badWord|nsfw|featureRoleIds|whitelist|immune)/.test(String(path));
function createBotBridge({ config }) {
  const events = new EventEmitter();
  const base = new URL(config.bot.apiUrl);
  if (base.protocol !== "https:" && !(base.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname))) throw new Error("Bot API must use HTTPS or a loopback SSH tunnel.");
  let state = { state: "CONNECTING", online: false, mode: "remote" };
  let timer, busy = false;
  const rpc = async (method, args = []) => {
    try {
      const response = await fetch(new URL("/rpc", base), { method: "POST", headers: { Authorization: `Bearer ${config.bot.apiSecret}`, "Content-Type": "application/json" }, body: JSON.stringify({ method, args }), signal: AbortSignal.timeout(config.bot.httpTimeoutMs || 15000) });
      const payload = await response.json();
      if (!response.ok) throw Object.assign(new Error(payload.error || "Bot API request failed"), { status: response.status });
      return payload.result;
    } catch (err) { if (!err.status) err.status = 503; throw err; }
  };
  const bridge = { botConfig: {}, isProtectedConfigPath: protectedPath, allowedConfigPaths: { has: path => typeof path === "string" && /^[a-zA-Z0-9_.]+$/.test(path) }, cleanValue: value => value, bridge: () => state };
  for (const method of ["status", "health", "botIdentity", "scanBotCommands", "safeConfig", "publicGuild", "auditEvents", "updateConfig", "canManageSecurity"]) bridge[method] = (...args) => rpc(method, args);
  bridge.guildsForSession = session => rpc("guildsForSession", [{ user: { id: session.user?.id }, guilds: session.guilds }]);
  bridge.botGuildIds = async () => new Set(await rpc("botGuildIds"));
  bridge.startBridgeMonitor = (interval = 5000) => {
    const check = async () => {
      if (busy) return;
      busy = true;
      try { const status = await bridge.status(); state = { state: status.online ? "ONLINE" : "CONNECTING", online: !!status.online, mode: "remote" }; events.emit("status", status); }
      catch { state = { state: "OFFLINE", online: false, mode: "remote" }; }
      finally { busy = false; events.emit("bridge", state); }
    };
    void check(); timer = setInterval(check, Math.max(5000, interval)); timer.unref(); return () => clearInterval(timer);
  };
  for (const name of ["Status", "Health", "Database", "Bridge"]) bridge[`on${name}`] = fn => { const event = name.toLowerCase(); events.on(event, fn); return () => events.off(event, fn); };
  bridge.close = () => { clearInterval(timer); events.removeAllListeners(); };
  return bridge;
}
module.exports = { createBotBridge, BRIDGE_STATES };
