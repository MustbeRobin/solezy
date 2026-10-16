const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const express = require("express");
const { registerDashboardRoutes } = require("../dashboard.js");

const guildId = "123456789012345678";
let server;
let baseUrl;
let botGuildLookups = 0;
let guildListLookups = 0;
let bridgeState = "OFFLINE";

before(async () => {
  const app = express();
  app.use((req, res, next) => {
    req.session = {
      user: { id: "234567890123456789", username: "Tester", avatar: null },
      guilds: [{ id: guildId, name: "Test server", permissions: "32", owner: false }],
      save: callback => callback()
    };
    next();
  });

  const botBridge = {
    bridge: () => ({ state: bridgeState }),
    botGuildIds: async () => { botGuildLookups += 1; return new Set([guildId]); },
    guildsForSession: async () => { guildListLookups += 1; return [{ id: guildId, name: "Test server", botPresent: true }]; },
    health: async () => ({ ok: true }),
    status: async () => ({ online: bridgeState === "ONLINE" }),
    canManageSecurity: async () => false,
    safeConfig: async () => ({}),
    publicGuild: async () => ({}),
    auditEvents: async () => [],
    scanBotCommands: async () => ({}),
    isProtectedConfigPath: () => false,
    allowedConfigPaths: { has: () => true },
    cleanValue: value => value,
    updateConfig: async () => ({})
  };

  registerDashboardRoutes(app, { botBridge, io: { to: () => ({ emit() {} }) }, oauth: {} });
  await new Promise(resolve => { server = app.listen(0, "127.0.0.1", resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
});

test("dashboard home is separate from the existing per-server settings page", async () => {
  const home = await fetch(`${baseUrl}/dashboard`);
  const settings = await fetch(`${baseUrl}/dashboard/${guildId}`);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /dashboard-home\.js/);
  assert.equal(settings.status, 200);
  assert.match(await settings.text(), /dashboard-booting/);
});

test("guild API serves OAuth guilds without waiting on an offline bot bridge", async () => {
  bridgeState = "OFFLINE";
  const response = await fetch(`${baseUrl}/api/guilds`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.bridgeState, "OFFLINE");
  assert.equal(data.allGuilds.length, 1);
  assert.equal(data.allGuilds[0].name, "Test server");
  assert.equal(data.allGuilds[0].botPresenceKnown, false);
  assert.equal(data.allGuilds[0].canInvite, false);
  assert.equal(data.allGuilds[0].canManage, false);
  assert.equal(data.botPresenceKnown, false);
  assert.equal(data.guilds.length, 0);
  assert.equal(botGuildLookups, 0);
  assert.equal(guildListLookups, 0);
});

test("guild API checks bot presence and installed servers when the bridge is online", async () => {
  bridgeState = "ONLINE";
  const response = await fetch(`${baseUrl}/api/guilds`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.botPresenceKnown, true);
  assert.equal(data.allGuilds[0].botPresenceKnown, true);
  assert.equal(data.allGuilds[0].botPresent, true);
  assert.equal(data.guilds.length, 1);
  assert.equal(botGuildLookups, 1);
  assert.equal(guildListLookups, 1);
});
