const state = {
  socket: null,
  csrfToken: null,
  user: null,
  guilds: [],
  allGuilds: [],
  guildSummary: { total: 0, owned: 0, withBot: 0, manageable: 0 },
  guildId: null,
  activePanel: "overview",
  guild: null,
  config: {},
  status: {},
  health: {},
  commands: [],
  commandCategories: [],
  pendingUpdates: new Map(),
  rollbackValues: new Map(),
  autosaveTimer: null,
  saving: false,
  saveQueued: false,
  guildRefreshTimer: null,
  lastGuildStatusSignature: ""
};

const REQUEST_TIMEOUT_MS = 10000;

function timeoutSignal(timeoutMs = REQUEST_TIMEOUT_MS) {
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    return AbortSignal.timeout(timeoutMs);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

async function settle(label, task, fallback = null) {
  try {
    return await task();
  } catch (error) {
    console.warn(`[dashboard] ${label} failed`, error);
    toast(`${label} unavailable. Continuing with loaded data.`, "error");
    return fallback;
  }
}

const DASHBOARD_CONFIG = window.SOEZY_CONFIG || {
  displayHost: /^\d{1,3}(?:\.\d{1,3}){3}$/.test(window.location.hostname) || window.location.port
    ? "16.170.133.221"
    : (window.location.hostname || "16.170.133.221"),
  apiOrigin: window.location.origin,
  socketOrigin: window.location.origin
};

const events = {
  antinuke: [
    ["antinuke.events.antibot", "Anti Bot"], ["antinuke.events.antiban", "Anti Ban"], ["antinuke.events.antikick", "Anti Kick"],
    ["antinuke.events.antichannelcreate", "Channel Create"], ["antinuke.events.antichanneldelete", "Channel Delete"], ["antinuke.events.antichannelupdate", "Channel Update"],
    ["antinuke.events.antirolecreate", "Role Create"], ["antinuke.events.antiroledelete", "Role Delete"], ["antinuke.events.antiroleupdate", "Role Update"],
    ["antinuke.events.antiwebhookcreate", "Webhook Create"], ["antinuke.events.antiwebhookdelete", "Webhook Delete"], ["antinuke.events.antiwebhookupdate", "Webhook Update"]
  ],
  logging: [
    ["logging.events.messageDelete", "Message Delete"], ["logging.events.memberJoin", "Member Join"], 
    ["logging.events.memberLeave", "Member Leave"], ["logging.events.memberBan", "Member Ban"], ["logging.events.memberUnban", "Member Unban"],
    ["logging.events.roleCreate", "Role Create"], ["logging.events.roleDelete", "Role Delete"], ["logging.events.channelCreate", "Channel Create"],
    ["logging.events.channelDelete", "Channel Delete"]
  ]
};

const modules = [
  { id: "antinuke", label: "Antinuke", icon: "AN", path: "antinuke.enabled", panel: "antinuke", features: 12, description: "Stops destructive raids, mass bans, role damage, and webhook abuse." },
  { id: "automod", label: "Automod", icon: "AM", path: "automod.enabled", panel: "automod", features: 6, description: "Filters spam, links, mentions, caps, emoji bursts, invites, and scam patterns." },
  { id: "logging", label: "Logging", icon: "LG", path: "logging.enabled", panel: "logging", features: 10, description: "Routes moderation, member, message, voice, invite, and admin events." },
  { id: "welcome", label: "Welcome", icon: "WC", path: "welcome.enabled", panel: "welcome", features: 7, description: "Sends polished welcome messages with variables, previews, and images." },
  { id: "ticket", label: "Tickets", icon: "TK", path: "ticket.enabled", panel: "tickets", features: 8, description: "Support panels, staff routing, ticket caps, and transcript workflows." },
  { id: "giveaway", label: "Giveaways", icon: "GW", path: "giveawaySystem.enabled", panel: "overview", features: 5, description: "Create, manage, reroll, and monitor giveaways for your community." },
  { id: "music", label: "Music", icon: "MS", path: "music.enabled", panel: "music", features: 9, description: "Playback controls, queues, volume state, and node-backed music sessions." },
  { id: "customRoles", label: "Custom Role", icon: "CR", path: "customRoles.enabled", panel: "customRoles", features: 4, description: "Self-managed role limits and premium identity controls." },
  { id: "security", label: "Security", icon: "SC", path: "", panel: "security", features: 5, description: "Live score built from protection modules and setup completeness." },
  { id: "verification", label: "Verification", icon: "VF", path: "verify.enabled", panel: "verification", features: 4, description: "Gate new members behind role-based verification panels." }
];

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
}

function dashboardUrl(path) {
  return new URL(path, DASHBOARD_CONFIG.apiOrigin || window.location.origin).toString();
}

function formatNumber(value) {
  const number = Number(value || 0);
  if (number >= 1000000) return `${(number / 1000000).toFixed(1)}M`;
  if (number >= 1000) return `${(number / 1000).toFixed(1)}K`;
  return number.toLocaleString();
}

function formatBytes(value) {
  if (value === undefined || value === null || value === "") return "--";
  const number = Number(value || 0);
  if (number >= 1024 ** 3) return `${(number / 1024 ** 3).toFixed(1)}GB`;
  if (number >= 1024 ** 2) return `${(number / 1024 ** 2).toFixed(1)}MB`;
  if (number >= 1024) return `${(number / 1024).toFixed(1)}KB`;
  return `${number}B`;
}

function formatUptime(seconds) {
  const total = Number(seconds || 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

function getPath(source, path, fallback = "") {
  if (!path) return fallback;
  return path.split(".").reduce((current, part) => current && current[part] !== undefined ? current[part] : undefined, source) ?? fallback;
}

function setPath(source, path, value) {
  const parts = path.split(".");
  let cursor = source;
  parts.slice(0, -1).forEach(part => {
    if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
}

function parseListInput(value) {
  return [...new Set(String(value || "")
    .split(/[\s,]+/)
    .map(item => item.replace(/[^\w:./-]/g, "").trim())
    .filter(Boolean))]
    .slice(0, 100);
}

function formatListInput(value) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function cssUrl(value) {
  return `url('${String(value || "").replace(/['\\]/g, "\\$&")}')`;
}

function routeState() {
  const parts = location.pathname.split("/").filter(Boolean);
  if (parts[0] !== "dashboard") return { guildId: "", panel: "overview" };
  if (parts[1] === "guild") return { guildId: parts[2] || "", panel: parts[3] || "overview" };
  return { guildId: parts[1] || "", panel: parts[2] || "overview" };
}

function setLoading(message) {
  const loader = q("[data-dashboard-loader]");
  const copy = q("[data-loader-copy]");
  const percent = q("[data-loader-percent]");
  if (copy && message) copy.textContent = message;
  const steps = ["Checking your secure session...", "Loading your servers...", "Syncing data...", "Fetching guild config..."];
  if (percent) percent.textContent = `${Math.min(96, Math.max(18, (steps.findIndex(step => step === message) + 1) * 24))}%`;
  loader?.classList.remove("is-hidden");
}

function revealDashboard() {
  q("[data-dashboard-loader]")?.classList.add("is-hidden");
  q("[data-dashboard-shell]")?.classList.remove("is-hidden");
  document.body.classList.remove("dashboard-booting");
}

function redirectToLogin() {
  const next = encodeURIComponent(location.pathname + location.search);
  location.replace(`/login?next=${next}`);
}

function setSyncState(label, mode = "live") {
  qa("[data-sync-state]").forEach(element => element.textContent = label);
  q("[data-sync-dot]")?.classList.toggle("warn", mode !== "live");
  q("[data-sync-dot]")?.classList.toggle("error", mode === "error");
}

function setSystemWarning(visible, message = "Waiting for the internal bot runtime. Live counters may be delayed.") {
  qa("[data-system-warning], [data-bridge-warning]").forEach(element => {
    element.hidden = !visible;
    const copy = q("span", element);
    if (copy) copy.textContent = message;
  });
}

async function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (state.csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes((options.method || "GET").toUpperCase())) {
    headers.set("X-CSRF-Token", state.csrfToken);
  }
  const response = await fetch(dashboardUrl(url), {
    credentials: "same-origin",
    ...options,
    headers,
    signal: options.signal || timeoutSignal(options.timeoutMs || REQUEST_TIMEOUT_MS)
  });
  let data = {};
  try { data = await response.json(); } catch {}
  if (response.status === 401) redirectToLogin();
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

function toast(message, tone = "info") {
  const element = q("[data-toast]");
  if (!element) return;
  element.textContent = message;
  element.dataset.tone = tone;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2600);
}

async function withButtonLoading(button, label, task) {
  if (!button) return task();
  const oldText = button.textContent;
  button.disabled = true;
  button.classList.add("is-loading");
  if (label) button.textContent = label;
  try {
    return await task();
  } finally {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.textContent = oldText;
  }
}

function showDashboardHome() {
  state.guildId = "";
  state.activePanel = "overview";
  q("[data-dashboard-home]")?.removeAttribute("hidden");
  q("[data-config-workspace]")?.setAttribute("hidden", "");
  q("[data-dashboard-title]") && (q("[data-dashboard-title]").textContent = "Dashboard");
  history.replaceState(null, "", "/dashboard");
  renderDashboardHome();
  renderServerRail();
}

async function activePanel(name, { push = true } = {}) {
  if (name === "home") return showDashboardHome();
  if (!state.guildId && state.guilds[0]?.id) {
    await selectGuild(state.guilds[0].id, { replaceHistory: true, preferSocket: false, panel: name });
  }
  if (!state.guildId) {
    toast("Choose a server first", "error");
    showDashboardHome();
    return;
  }
  state.activePanel = name || "overview";
  qa("[data-panel-nav] button").forEach(button => button.classList.toggle("active", button.dataset.panel === state.activePanel));
  qa("[data-panel-view]").forEach(panel => panel.classList.toggle("active", panel.dataset.panelView === state.activePanel));
  q("[data-dashboard-home]")?.setAttribute("hidden", "");
  q("[data-config-workspace]")?.removeAttribute("hidden");
  q("[data-sidebar]")?.classList.remove("open");
  if (push) history.replaceState(null, "", `/dashboard/guild/${state.guildId}/${state.activePanel}`);
  if (state.activePanel === "logging") loadAudit();
  if (state.activePanel === "commands") renderCommands();
  if (state.activePanel === "status" || state.activePanel === "analytics") loadStatus();
}

function bindNavigation() {
  qa("[data-panel-nav] button").forEach(button => button.addEventListener("click", () => activePanel(button.dataset.panel)));
  q("[data-sidebar-avatar]")?.addEventListener("click", () => activePanel("profile"));
  q("[data-sidebar-toggle]")?.addEventListener("click", () => q("[data-sidebar]")?.classList.toggle("open"));
  q("[data-save-changes]")?.addEventListener("click", () => saveChanges({ manual: true }));
  q("[data-discard-changes]")?.addEventListener("click", discardChanges);
  qa("[data-refresh-guilds]").forEach(button => button.addEventListener("click", async () => {
    try {
      await withButtonLoading(button, "Refreshing...", async () => {
      await loadGuilds();
      if (state.guildId) await selectGuild(state.guildId, { replaceHistory: false, preferSocket: false, panel: state.activePanel });
      else showDashboardHome();
      });
      toast("Servers refreshed");
    } catch (error) {
      toast(error.message || "Could not refresh servers", "error");
    }
  }));
  qa("[data-logout]").forEach(button => button.addEventListener("click", async () => {
    try { await apiFetch("/api/auth/logout", { method: "POST" }); }
    finally { location.href = "/login"; }
  }));
  qa("[data-command-search]").forEach(button => button.addEventListener("click", openCommandModal));
  q("[data-command-close]")?.addEventListener("click", closeCommandModal);
  q("[data-command-modal]")?.addEventListener("click", event => {
    if (event.target === q("[data-command-modal]")) closeCommandModal();
  });
  q("[data-command-search-input]")?.addEventListener("input", event => renderCommands(event.target.value, q("[data-command-results]")));
  q("[data-command-inline-search]")?.addEventListener("input", event => renderCommands(event.target.value));
  q("[data-command-clear]")?.addEventListener("click", () => {
    const input = q("[data-command-inline-search]");
    if (input) input.value = "";
    renderCommands("");
  });
  q("[data-logging-setup]")?.addEventListener("click", () => {
    if (!state.guildId) return toast("Choose a server first", "error");
    optimisticEdit("logging.enabled", true, { immediate: true });
    events.logging.forEach(([path]) => optimisticEdit(path, true, { immediate: true }));
    activePanel("logging");
    toast("Logging setup queued");
  });
  addEventListener("keydown", event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openCommandModal();
    }
    if (event.key === "Escape") closeCommandModal();
  });
}

function renderEventGroups() {
  Object.entries(events).forEach(([group, items]) => {
    const target = q(`[data-event-group="${group}"]`);
    if (!target || target.dataset.rendered) return;
    target.dataset.rendered = "true";
    target.innerHTML = items.map(([path, label]) => `
      <label class="event-toggle">
        <span>${escapeHtml(label)}</span>
        <input type="checkbox" data-bind="${escapeHtml(path)}">
      </label>
    `).join("");
  });
}

function renderSecuritySettings() {
  for (const system of ["antinuke", "automod"]) {
    const target = q(`[data-security-settings="${system}"]`);
    if (!target) continue;
    const features = state.config.securitySchema?.[system];
    if (!Array.isArray(features)) {
      target.innerHTML = "";
      continue;
    }
    const groups = new Map();
    for (const feature of features) {
      const group = groups.get(feature.group) || [];
      group.push(feature);
      groups.set(feature.group, group);
    }
    target.innerHTML = [...groups].map(([name, items]) => `
      <section class="security-feature-group">
        <h3>${escapeHtml(name)}</h3>
        ${items.map(feature => {
          const enabled = Boolean(getPath(state.config, feature.enabledPath, feature.enabled));
          const controls = (feature.fields || []).map(field => {
            const value = getPath(state.config, field.path, field.value ?? field.default);
            if (field.type === "select") {
              return `<label>${escapeHtml(field.label)}<select data-bind="${escapeHtml(field.path)}">${(field.options || []).map(option => `<option value="${escapeHtml(option)}" ${value === option ? "selected" : ""}>${escapeHtml(option.toUpperCase())}</option>`).join("")}</select></label>`;
            }
            if (field.type === "list") {
              return `<label class="security-list-field">${escapeHtml(field.label)}<textarea rows="2" data-list-bind="${escapeHtml(field.path)}">${escapeHtml(Array.isArray(value) ? value.join("\n") : "")}</textarea></label>`;
            }
            return `<label>${escapeHtml(field.label)}<input type="number" min="${Number(field.min) || 0}" max="${Number(field.max) || 100000}" step="${Number(field.step) || 1}" data-bind="${escapeHtml(field.path)}" value="${Number(value ?? field.default) || 0}"></label>`;
          }).join("");
          return `<article class="security-feature-row">
            <div class="security-feature-title">
              <label class="toggle-row"><span><b>${escapeHtml(feature.label)}</b><small data-feature-status="${escapeHtml(feature.enabledPath)}"></small></span><input type="checkbox" data-bind="${escapeHtml(feature.enabledPath)}" ${enabled ? "checked" : ""}></label>
            </div>
            <div class="security-feature-fields">${controls}</div>
          </article>`;
        }).join("")}
      </section>
    `).join("");
  }
  renderSecurityStateLabels();
  bindInputs();
}

function renderSecurityStateLabels() {
  for (const system of ["antinuke", "automod"]) {
    const enabled = Boolean(getPath(state.config, `${system}.systemEnabled`, getPath(state.config, `${system}.enabled`, false)));
    const label = q(`[data-security-parent-state="${system}"]`);
    if (label) label.textContent = enabled ? "Active" : "Inactive";
    qa(`[data-feature-status]`).filter(node => node.dataset.featureStatus.startsWith(`${system}.`) || (system === "automod" && !node.dataset.featureStatus.startsWith("antinuke."))).forEach(node => {
      const configured = Boolean(getPath(state.config, node.dataset.featureStatus, false));
      node.textContent = configured ? (enabled ? "ON · ACTIVE" : "ON · INACTIVE") : "OFF";
    });
  }
}

function applyAvatar(element, image, fallback) {
  if (!element) return;
  const label = fallback || "";
  element.textContent = label;
  element.style.backgroundImage = "";
  element.classList.toggle("has-image", false);
  if (!image) return;
  const test = new Image();
  test.onload = () => {
    element.textContent = "";
    element.style.backgroundImage = cssUrl(image);
    element.classList.toggle("has-image", true);
  };
  test.onerror = () => {
    element.textContent = label;
    element.style.backgroundImage = "";
    element.classList.toggle("has-image", false);
  };
  test.src = image;
}

function renderDashboardHome() {
  const username = state.user?.username || "User";
  qa("[data-user-name]").forEach(element => element.textContent = username);
  q("[data-topbar-user]") && (q("[data-topbar-user]").textContent = username);
  qa("[data-user-avatar]").forEach(element => applyAvatar(element, state.user?.avatar, username.slice(0, 1).toUpperCase()));
  applyAvatar(q("[data-sidebar-avatar]"), state.user?.avatar, username.slice(0, 1).toUpperCase());
  applyAvatar(q("[data-topbar-avatar]"), state.user?.avatar, "");
  q("[data-user-total]") && (q("[data-user-total]").textContent = state.guildSummary.total ?? state.allGuilds.length);
  q("[data-user-manageable]") && (q("[data-user-manageable]").textContent = state.guildSummary.manageable ?? state.allGuilds.length);
  q("[data-user-owned]") && (q("[data-user-owned]").textContent = state.guildSummary.owned ?? 0);
  q("[data-user-with-bot]") && (q("[data-user-with-bot]").textContent = state.guildSummary.withBot ?? state.guilds.length);

  const grid = q("[data-server-grid]");
  if (!grid) return;
  const guilds = state.allGuilds.length ? state.allGuilds : state.guilds.map(guild => ({ ...guild, botPresent: true, canManage: true }));
  if (!guilds.length) {
    grid.innerHTML = `<article class="server-card empty"><h3>No manageable servers found</h3><p>Login again or add Soezy to a server you manage.</p><a class="button primary small" href="/invite">Add to Discord</a></article>`;
    return;
  }
  grid.innerHTML = guilds.map(guild => {
    const badges = Array.isArray(guild.permissionBadges) && guild.permissionBadges.length
      ? guild.permissionBadges
      : [guild.owner ? "OWNER" : guild.isAdmin ? "ADMIN" : "MANAGE SERVER"];
    const icon = guild.iconUrl || guild.icon || "";
    const avatarStyle = icon ? ` style="background-image:${cssUrl(icon)}"` : "";
    const status = guild.botPresent ? "Live" : "Not Installed";
    const action = guild.botPresent
      ? `<button class="button primary small" data-configure-guild="${escapeHtml(guild.id)}" type="button">Configure</button><button class="button ghost small" data-dashboard-guild="${escapeHtml(guild.id)}" type="button">Dashboard</button>`
      : `<a class="button primary small" href="/invite?guild_id=${escapeHtml(guild.id)}">Add Bot</a>`;
    return `
      <article class="server-card ${guild.botPresent ? "with-bot" : ""}">
        <div class="server-card-top">
          <div class="server-card-icon"${avatarStyle}>${escapeHtml((guild.name || "S").slice(0, 1).toUpperCase())}</div>
          <span class="live-pill ${guild.botPresent ? "online" : "offline"}">${escapeHtml(status)}</span>
        </div>
        <h3>${escapeHtml(guild.name || "Server")}</h3>
        <div class="server-badge-row">
          ${badges.map(badge => `<span class="server-badge">${escapeHtml(badge)}</span>`).join("")}
          <span class="server-badge ${guild.botPresent ? "installed" : "muted"}">${guild.botPresent ? "BOT INSTALLED" : "ADD BOT"}</span>
          ${guild.premium ? `<span class="server-badge premium">PREMIUM</span>` : ""}
        </div>
        <div class="server-card-actions">${action}</div>
      </article>
    `;
  }).join("");
  qa("[data-configure-guild]", grid).forEach(button => {
    button.addEventListener("click", () => withButtonLoading(button, "Opening...", () => selectGuild(button.dataset.configureGuild, { replaceHistory: true, preferSocket: false })));
  });
  qa("[data-dashboard-guild]", grid).forEach(button => {
    button.addEventListener("click", () => withButtonLoading(button, "Loading...", () => selectGuild(button.dataset.dashboardGuild, { replaceHistory: true, preferSocket: true })));
  });
}

function renderServerRail() {
  const rail = q("[data-server-rail]");
  if (!rail) return;
  const guilds = state.allGuilds.length ? state.allGuilds : state.guilds.map(guild => ({ ...guild, botPresent: true, canManage: true }));
  rail.innerHTML = `
    <button class="rail-server ${!state.guildId ? "active" : ""}" data-rail-home type="button" title="Dashboard Home"><span>HM</span></button>
    ${guilds.map(guild => {
      const active = state.guildId === guild.id ? "active" : "";
      const present = guild.botPresent ? " bot-present" : "";
      const initial = escapeHtml((guild.name || "S").slice(0, 1).toUpperCase());
      const icon = guild.iconUrl || guild.icon || "";
      const image = icon ? `<i style="background-image:${cssUrl(icon)}"></i>` : `<span>${initial}</span>`;
      return `<button class="rail-server ${active}${present}" data-rail-guild="${escapeHtml(guild.id)}" type="button" title="${escapeHtml(guild.name || "Server")} - ${guild.botPresent ? "Installed" : "Add Bot"}">${image}</button>`;
    }).join("")}
  `;
  q("[data-rail-home]", rail)?.addEventListener("click", () => activePanel("home"));
  qa("[data-rail-guild]", rail).forEach(button => {
    button.addEventListener("click", () => {
      const guild = guilds.find(item => item.id === button.dataset.railGuild);
      if (guild?.botPresent) selectGuild(guild.id, { replaceHistory: true, preferSocket: false });
      else location.href = `/invite?guild_id=${encodeURIComponent(guild?.id || "")}`;
    });
  });
}

function renderGuildSelect() {
  const select = q("[data-guild-select]");
  if (!select) return;
  const guilds = state.allGuilds.length ? state.allGuilds : state.guilds;
  select.innerHTML = guilds.length
    ? `<option value="">Dashboard Home</option>` + guilds.map(guild => {
      const suffix = guild.botPresent ? "Installed" : "Add Bot";
      return `<option value="${escapeHtml(guild.id)}">${escapeHtml(guild.name)} - ${suffix}</option>`;
    }).join("")
    : `<option value="">No manageable servers</option>`;
  select.value = state.guildId || "";
  if (!select.dataset.bound) {
    select.dataset.bound = "true";
    select.addEventListener("change", () => {
      if (!select.value) return activePanel("home");
      const guild = (state.allGuilds.length ? state.allGuilds : state.guilds).find(item => item.id === select.value);
      if (guild && !guild.botPresent) {
        location.href = `/invite?guild_id=${encodeURIComponent(guild.id)}`;
        return;
      }
      selectGuild(select.value);
    });
  }
}

function renderOverview() {
  if (!state.guild) return;
  q("[data-dashboard-title]") && (q("[data-dashboard-title]").textContent = `${state.guild.name} Control`);
  q("[data-server-name]") && (q("[data-server-name]").textContent = state.guild.name);
  q("[data-server-meta]") && (q("[data-server-meta]").textContent = `${formatNumber(state.guild.stats.members)} members | ${state.guild.stats.channels} channels | ${state.guild.risk} risk`);
  applyAvatar(q("[data-server-avatar]"), state.guild.icon, state.guild.name.slice(0, 1).toUpperCase());
  applyAvatar(q("[data-sidebar-guild-icon]"), state.guild.icon, state.guild.name.slice(0, 1).toUpperCase());
  q("[data-sidebar-guild-name]") && (q("[data-sidebar-guild-name]").textContent = state.guild.name);
  q("[data-sidebar-guild-meta]") && (q("[data-sidebar-guild-meta]").textContent = `${state.guild.stats.modules} modules active`);
  qa("[data-security-score]").forEach(element => element.textContent = state.guild.stats.securityScore);
  Object.entries(state.guild.stats).forEach(([key, value]) => {
    qa(`[data-metric="${key}"]`).forEach(element => element.textContent = typeof value === "number" ? value.toLocaleString() : value);
  });
  const riskPercent = state.guild.risk === "Low" ? 88 : state.guild.risk === "Medium" ? 58 : 32;
  q("[data-risk-bar]") && (q("[data-risk-bar]").style.width = `${riskPercent}%`);
  q("[data-risk-copy]") && (q("[data-risk-copy]").textContent = `${state.guild.risk} risk. ${state.guild.stats.modules} modules are currently active.`);
  const moduleTags = Object.entries(state.guild.modules || {})
    .map(([name, enabled]) => `<span class="${enabled ? "on" : ""}">${escapeHtml(name.replace(/([A-Z])/g, " $1"))}</span>`)
    .join("");
  qa("[data-module-strip], [data-security-modules]").forEach(element => element.innerHTML = moduleTags);
  renderModuleCards();
  renderPanelBadges();
}

function renderPanelBadges() {
  const antinukeFeatures = state.config.securitySchema?.antinuke || [];
  const antinukeTotal = antinukeFeatures.length || events.antinuke.length;
  const antiParentEnabled = Boolean(getPath(state.config, "antinuke.systemEnabled", getPath(state.config, "antinuke.enabled", false)));
  const antinukeActive = antinukeFeatures.length
    ? antinukeFeatures.filter(feature => antiParentEnabled && Boolean(getPath(state.config, feature.enabledPath, feature.enabled))).length
    : events.antinuke.filter(([path]) => antiParentEnabled && Boolean(getPath(state.config, path, false))).length;
  q("[data-antinuke-armed]") && (q("[data-antinuke-armed]").textContent = `${antinukeActive}/${antinukeTotal} armed`);
  const automodFeatures = state.config.securitySchema?.automod || [];
  const autoParentEnabled = Boolean(getPath(state.config, "automod.systemEnabled", getPath(state.config, "automod.enabled", false)));
  const automodActive = automodFeatures.length
    ? automodFeatures.filter(feature => autoParentEnabled && Boolean(getPath(state.config, feature.enabledPath, feature.enabled))).length
    : 0;
  q("[data-automod-armed]") && (q("[data-automod-armed]").textContent = `${automodActive} active modules`);
  const loggingTotal = events.logging.length;
  const loggingActive = events.logging.filter(([path]) => Boolean(getPath(state.config, path, false))).length;
  q("[data-logging-count]") && (q("[data-logging-count]").textContent = `${loggingActive}/${loggingTotal} events enabled`);
}

function renderModuleCards() {
  const target = q("[data-module-cards]");
  if (!target) return;
  target.innerHTML = modules.map(module => {
    const enabled = module.path ? Boolean(getPath(state.config, module.path, false)) : module.id === "security";
    const checked = enabled ? "checked" : "";
    const disabled = module.path ? "" : "disabled";
    return `
      <article class="module-card ${enabled ? "enabled" : ""}" data-module-open="${escapeHtml(module.panel)}">
        <div class="module-card-top">
          <i>${escapeHtml(module.icon)}</i>
          <label class="mini-switch" title="${module.path ? "Toggle module" : "Open module"}">
            <input type="checkbox" data-module-toggle="${escapeHtml(module.path)}" ${checked} ${disabled}>
          </label>
        </div>
        <h3>${escapeHtml(module.label)}</h3>
        <p>${escapeHtml(module.description)}</p>
        <div class="module-card-meta">
          <small>${module.features} features</small>
          <small>${enabled ? "Live" : "Ready"}</small>
        </div>
        <span>${enabled ? "Enabled" : "Disabled"}</span>
      </article>
    `;
  }).join("");
  qa("[data-module-open]", target).forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("[data-module-toggle]")) return;
      activePanel(card.dataset.moduleOpen);
    });
  });
  qa("[data-module-toggle]", target).forEach(input => {
    input.addEventListener("change", event => {
      const path = input.dataset.moduleToggle;
      if (!path) return;
      event.stopPropagation();
      optimisticEdit(path, input.checked, { immediate: true });
      renderModuleCards();
    });
  });
}

function syncOutputs() {
  qa("[data-output-for]").forEach(output => {
    const input = q(`[data-bind="${output.dataset.outputFor}"]`);
    output.textContent = input?.value || "";
  });
}

function renderBindings() {
  renderSecuritySettings();
  qa("[data-bind]").forEach(input => {
    const value = getPath(state.config, input.dataset.bind, input.type === "checkbox" ? false : "");
    if (input.type === "checkbox") input.checked = Boolean(value);
    else input.value = value ?? "";
  });
  qa("[data-list-bind]").forEach(input => {
    input.value = formatListInput(getPath(state.config, input.dataset.listBind, []));
  });
  syncOutputs();
  renderPreviews();
  renderPanelBadges();
  renderSecurityStateLabels();
  renderWhitelistPanel();
}

function renderWhitelistPanel() {
  const users = getPath(state.config, "security.whitelistUsers", []);
  const roles = getPath(state.config, "security.whitelistRoles", []);
  q("[data-whitelist-user-count]") && (q("[data-whitelist-user-count]").textContent = Array.isArray(users) ? users.length : 0);
  q("[data-whitelist-role-count]") && (q("[data-whitelist-role-count]").textContent = Array.isArray(roles) ? roles.length : 0);
}

function renderPreviews() {
  q("[data-welcome-title]") && (q("[data-welcome-title]").textContent = getPath(state.config, "welcome.title", "Welcome to {server}") || "Welcome to {server}");
  q("[data-welcome-message]") && (q("[data-welcome-message]").textContent = getPath(state.config, "welcome.message", "Welcome {user} to {server}!"));
  q("[data-welcome-footer]") && (q("[data-welcome-footer]").textContent = getPath(state.config, "welcome.footer", "Variables: {user}, {server}, {membercount}") || "Variables: {user}, {server}, {membercount}");
}

function readInputValue(input) {
  if (input.type === "checkbox") return input.checked;
  if (input.type === "range" || input.type === "number") return Number(input.value);
  return input.value;
}

function showSaveStatus(message, mode = "warn", autoHide = false) {
  const bar = q("[data-save-bar]");
  const copy = q("[data-save-copy]");
  if (bar) {
    bar.hidden = false;
    bar.dataset.mode = mode;
  }
  if (copy) copy.textContent = message;
  setSyncState(message, mode === "error" ? "error" : mode === "live" ? "live" : "warn");
  clearTimeout(showSaveStatus.timer);
  if (autoHide) {
    showSaveStatus.timer = setTimeout(() => {
      if (!state.pendingUpdates.size && !state.saving && bar) bar.hidden = true;
    }, 1600);
  }
}

function updateSaveBar() {
  const count = state.pendingUpdates.size;
  const bar = q("[data-save-bar]");
  const copy = q("[data-save-copy]");
  const save = q("[data-save-changes]");
  const discard = q("[data-discard-changes]");
  if (bar) {
    bar.hidden = count === 0 && !state.saving;
    bar.dataset.mode = state.saving ? "saving" : "warn";
  }
  if (copy) {
    copy.textContent = state.saving
      ? "Saving..."
      : count === 1 ? "Saving 1 change..." : `Saving ${count} changes...`;
  }
  if (save) save.disabled = !count || state.saving || !state.guildId;
  if (discard) discard.disabled = !count || state.saving;
}

function queueAutosave(delay = 750) {
  clearTimeout(state.autosaveTimer);
  state.autosaveTimer = setTimeout(() => saveChanges({ manual: false }), delay);
}

function markUnsaved(path, value, previousValue, immediate = false) {
  if (!state.rollbackValues.has(path)) state.rollbackValues.set(path, previousValue);
  state.pendingUpdates.set(path, value);
  updateSaveBar();
  setSyncState("Saving...", "warn");
  queueAutosave(immediate ? 120 : 750);
}

function bindInputs() {
  qa("[data-bind]").forEach(input => {
    if (input.dataset.bound) return;
    input.dataset.bound = "true";
    const edit = () => {
      const path = input.dataset.bind;
      const value = readInputValue(input);
      optimisticEdit(path, value, { immediate: input.type === "checkbox" || input.tagName === "SELECT" });
    };
    const liveEvent = input.type === "checkbox" || input.tagName === "SELECT" ? "change" : "input";
    input.addEventListener(liveEvent, edit);
    if (liveEvent !== "change") input.addEventListener("change", edit);
  });
  qa("[data-list-bind]").forEach(input => {
    if (input.dataset.bound) return;
    input.dataset.bound = "true";
    input.addEventListener("input", () => {
      optimisticEdit(input.dataset.listBind, parseListInput(input.value), { immediate: false });
    });
    input.addEventListener("change", () => {
      optimisticEdit(input.dataset.listBind, parseListInput(input.value), { immediate: true });
    });
  });
}

function optimisticEdit(path, value, { immediate = false } = {}) {
  if (!state.guildId) {
    toast("Choose a server first", "error");
    return;
  }
  const previousValue = getPath(state.config, path, undefined);
  setPath(state.config, path, value);
  syncOutputs();
  renderPreviews();
  renderModuleCards();
  renderPanelBadges();
  renderSecurityStateLabels();
  renderWhitelistPanel();
  markUnsaved(path, value, previousValue, immediate);
}

function applyGuildPayload(result, { clearPending = false } = {}) {
  if (result?.guild) state.guild = result.guild;
  if (result?.config) state.config = result.config;
  if (clearPending) {
    state.pendingUpdates.clear();
    state.rollbackValues.clear();
  } else {
    for (const [path, value] of state.pendingUpdates) setPath(state.config, path, value);
  }
  renderOverview();
  renderBindings();
  updateSaveBar();
}

async function saveChanges({ manual = false } = {}) {
  clearTimeout(state.autosaveTimer);
  if (!state.guildId || !state.pendingUpdates.size) return;
  if (state.saving) {
    state.saveQueued = true;
    return;
  }
  const updates = Object.fromEntries(state.pendingUpdates);
  state.saving = true;
  updateSaveBar();
  showSaveStatus("Saving...", "saving");
  try {
    const result = await apiFetch("/api/config/update", {
      method: "POST",
      body: JSON.stringify({ guildId: state.guildId, updates })
    });
    for (const [path, value] of Object.entries(updates)) {
      if (state.pendingUpdates.get(path) === value) {
        state.pendingUpdates.delete(path);
        state.rollbackValues.delete(path);
      }
    }
    applyGuildPayload(result, { clearPending: state.pendingUpdates.size === 0 });
    if (!state.pendingUpdates.size) {
      showSaveStatus("Saved", "live", true);
      if (manual) toast("Saved successfully");
    } else {
      queueAutosave(400);
    }
  } catch (error) {
    toast(error.message || "Could not save settings", "error");
    showSaveStatus("Save failed", "error");
  } finally {
    state.saving = false;
    if (state.saveQueued || state.pendingUpdates.size) {
      state.saveQueued = false;
      queueAutosave(400);
    } else {
      updateSaveBar();
    }
  }
}

async function discardChanges() {
  if (!state.guildId || state.saving) return;
  clearTimeout(state.autosaveTimer);
  state.pendingUpdates.clear();
  state.rollbackValues.clear();
  updateSaveBar();
  await selectGuild(state.guildId, { replaceHistory: false, preferSocket: false, panel: state.activePanel });
  toast("Changes reset");
}

async function loadGuildViaApi(guildId) {
  const result = await apiFetch(`/api/guilds/${guildId}`);
  return { ok: true, ...result };
}

function loadGuildViaSocket(guildId) {
  return new Promise((resolve, reject) => {
    if (!state.socket?.connected) return reject(new Error("Socket unavailable"));
    state.socket.timeout(7000).emit("guild:join", guildId, (error, result) => {
      if (error || !result?.ok) return reject(new Error(result?.error || "Could not load server"));
      resolve(result);
    });
  });
}

async function loadGuild(guildId, { preferSocket = true } = {}) {
  if (!guildId) return null;
  if (preferSocket && state.socket?.connected) {
    try { return await loadGuildViaSocket(guildId); }
    catch { setSyncState("HTTP Sync", "warn"); }
  }
  return loadGuildViaApi(guildId);
}

async function selectGuild(guildId, { replaceHistory = true, preferSocket = true, panel = "overview" } = {}) {
  if (!guildId) return;
  const knownGuild = (state.allGuilds.length ? state.allGuilds : state.guilds).find(guild => guild.id === guildId);
  if (knownGuild && !knownGuild.botPresent) {
    location.href = `/invite?guild_id=${encodeURIComponent(guildId)}`;
    return;
  }
  state.guildId = guildId;
  state.activePanel = panel || "overview";
  if (replaceHistory) history.replaceState(null, "", `/dashboard/guild/${guildId}/${state.activePanel}`);
  q("[data-dashboard-home]")?.setAttribute("hidden", "");
  q("[data-config-workspace]")?.removeAttribute("hidden");
  renderGuildSelect();
  setSyncState("Loading", "warn");
  renderServerRail();
  try {
    const result = await loadGuild(guildId, { preferSocket });
    state.guild = result.guild;
    state.config = result.config;
    state.pendingUpdates.clear();
    state.rollbackValues.clear();
    applyGuildPayload(result, { clearPending: true });
    await activePanel(state.activePanel, { push: replaceHistory });
    loadAudit();
    setSyncState(state.socket?.connected ? "Live" : "HTTP Sync", state.socket?.connected ? "live" : "warn");
    renderServerRail();
  } catch (error) {
    toast(error.message || "Could not load server", "error");
    setSyncState(state.socket?.connected ? "Live" : "Offline", state.socket?.connected ? "live" : "warn");
  }
}

async function loadAudit() {
  if (!state.guildId) return;
  try {
    const data = await apiFetch(`/api/guilds/${state.guildId}/audit`);
    const target = q("[data-audit-list]");
    if (!target) return;
    target.innerHTML = (data.events || []).map(event => `
      <article>
        <b>${escapeHtml(event.type)}</b>
        <span>${escapeHtml(event.detail)}</span>
        <small>${escapeHtml(new Date(event.at).toLocaleString())}</small>
      </article>
    `).join("");
  } catch (error) {
    toast(error.message, "error");
  }
}

async function loadGuilds() {
  const data = await apiFetch("/api/guilds");
  state.guilds = data.guilds || [];
  state.allGuilds = data.allGuilds || state.guilds;
  state.guildSummary = data.summary || {
    total: state.allGuilds.length,
    owned: state.allGuilds.filter(guild => guild.owner).length,
    withBot: state.allGuilds.filter(guild => guild.botPresent).length,
    manageable: state.allGuilds.length
  };
  const route = routeState();
  const routeGuild = (state.allGuilds.length ? state.allGuilds : state.guilds).find(guild => guild.id === route.guildId);
  state.guildId = routeGuild?.botPresent ? routeGuild.id : "";
  state.activePanel = route.panel || "overview";
  renderGuildSelect();
  renderDashboardHome();
  renderServerRail();
}

async function loadCommands() {
  try {
    const data = await apiFetch("/api/commands");
    state.commands = data.commands || [];
    state.commandCategories = data.categories || [];
    renderCommands();
  } catch {
    state.commands = [];
  }
}

function commandCard(command) {
  const aliases = Array.isArray(command.aliases) && command.aliases.length ? `Aliases: ${command.aliases.join(", ")}` : command.usage || command.category || "";
  return `
    <article class="command-card">
      <h3>${escapeHtml(command.name || "command")}</h3>
      <p>${escapeHtml(command.description || "No description provided.")}</p>
      <small>${escapeHtml(command.category || "general")} ${aliases ? `- ${escapeHtml(aliases)}` : ""}</small>
    </article>
  `;
}

function renderCommands(query = "", target = q("[data-command-grid]")) {
  if (!target) return;
  const term = String(query || "").trim().toLowerCase();
  const commands = state.commands.filter(command => {
    const haystack = [
      command.name,
      command.description,
      command.category,
      command.usage,
      ...(Array.isArray(command.aliases) ? command.aliases : [])
    ].join(" ").toLowerCase();
    return !term || haystack.includes(term);
  }).slice(0, 80);
  target.innerHTML = commands.length
    ? commands.map(commandCard).join("")
    : `<article class="command-card"><h3>No commands found</h3><p>Try another search or refresh the command list.</p></article>`;
}

function openCommandModal() {
  const modal = q("[data-command-modal]");
  if (!modal) return;
  modal.hidden = false;
  const input = q("[data-command-search-input]");
  if (input) {
    input.value = "";
    setTimeout(() => input.focus(), 50);
  }
  renderCommands("", q("[data-command-results]"));
}

function closeCommandModal() {
  const modal = q("[data-command-modal]");
  if (modal) modal.hidden = true;
}

function applyStatus(status = {}) {
  state.status = status;
  if (typeof applyBotIdentity === "function") applyBotIdentity(status);
  const latency = status.latency ?? status.ping;
  const bridgeState = status.bridgeState || status.bridge?.state || (status.online ? "ONLINE" : "CONNECTING");
  const syncLabel = bridgeState === "ONLINE" ? (status.sync || "Internal") : bridgeState;
  qa("[data-latency]").forEach(element => element.textContent = latency === null || latency === undefined ? "--" : latency);
  q("[data-runtime-label]") && (q("[data-runtime-label]").textContent = syncLabel);
  const statusMap = {
    online: status.online ? "Online" : "Offline",
    latency: latency ?? "--",
    uptime: formatUptime(status.uptime),
    servers: formatNumber(status.servers ?? status.guilds ?? status.guildCount),
    users: formatNumber(status.users),
    shards: status.shards ?? "--",
    clusters: status.clusters ?? "--",
    sync: syncLabel,
    commands: formatNumber(status.commands),
    memory: formatBytes(status.memory?.heapUsed || status.memory?.rss),
    cpu: Array.isArray(status.cpu?.loadavg) ? status.cpu.loadavg[0].toFixed(2) : "--"
  };
  Object.entries(statusMap).forEach(([key, value]) => {
    qa(`[data-status="${key}"]`).forEach(element => element.textContent = value);
  });
  const signature = [status.servers, status.users, status.commands, status.shards].join(":");
  if (signature && state.lastGuildStatusSignature && signature !== state.lastGuildStatusSignature && state.user) {
    clearTimeout(state.guildRefreshTimer);
    state.guildRefreshTimer = setTimeout(() => {
      if (!state.pendingUpdates.size) loadGuilds().catch(() => {});
    }, 900);
  }
  if (signature) state.lastGuildStatusSignature = signature;
}

function applyHealth(health = {}) {
  state.health = health;
  const bridge = health.bridge || health.bot?.bridge || {};
  const bridgeState = health.bridgeState || bridge.state || (health.bot?.online ? "ONLINE" : "CONNECTING");
  if (health.bot) {
    applyStatus({
      ...health.bot,
      botUsername: health.bot.botUsername || health.bot.username,
      botAvatar: health.bot.botAvatar || health.bot.avatar,
      botVerified: health.bot.botVerified ?? health.bot.verified,
      bridge,
      bridgeState,
      sync: bridgeState === "ONLINE" ? "Internal" : bridgeState
    });
  }
  const systemOnline = health.system?.online !== false && health.ok !== false;
  setSystemWarning(!systemOnline, health.system?.lastError ? `Starting: ${health.system.lastError}` : undefined);
  if (!systemOnline) setSyncState(bridgeState, bridgeState === "OFFLINE" ? "error" : "warn");
}

async function loadHealth() {
  try {
    const data = await apiFetch("/health");
    applyHealth(data);
  } catch {
    setSystemWarning(true);
    setSyncState("Starting", "warn");
  }
}

async function loadStatus() {
  try {
    const data = await apiFetch("/api/status");
    applyStatus(data);
  } catch {}
}

async function refreshLiveDataFromRuntime() {
  if (state.pendingUpdates.size) return;
  try {
    setSyncState("Refreshing", "warn");
    await Promise.all([loadHealth(), loadGuilds()]);
    if (state.guildId) {
      await selectGuild(state.guildId, { replaceHistory: false, preferSocket: false, panel: state.activePanel });
    } else {
      renderDashboardHome();
    }
    setSyncState(state.socket?.connected ? "Live" : "HTTP Sync", state.socket?.connected ? "live" : "warn");
  } catch {
    setSyncState(state.socket?.connected ? "Live" : "Sync Delayed", state.socket?.connected ? "live" : "warn");
  }
}

function connectSocket() {
  if (state.socket) {
    state.socket.removeAllListeners();
    state.socket.disconnect();
  }
  state.socket = io(DASHBOARD_CONFIG.socketOrigin || window.location.origin, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 700,
    reconnectionDelayMax: 5000,
    timeout: 10000
  });
  state.socket.on("connect", () => {
    setSyncState(state.pendingUpdates.size ? "Saving..." : "Live", state.pendingUpdates.size ? "warn" : "live");
    if (state.guildId && !state.pendingUpdates.size) selectGuild(state.guildId, { replaceHistory: false, preferSocket: true, panel: state.activePanel });
  });
  state.socket.on("disconnect", () => setSyncState("Reconnecting", "warn"));
  state.socket.io.on("reconnect_attempt", () => setSyncState("Reconnecting", "warn"));
  state.socket.io.on("reconnect_error", () => setSyncState("Retrying", "warn"));
  state.socket.on("connect_error", () => setSyncState("Offline", "warn"));
  state.socket.on("status:update", status => applyStatus(status));
  state.socket.on("health:update", health => applyHealth(health));
  state.socket.on("bridge:update", bridge => {
    const stateLabel = bridge?.state || "CONNECTING";
    setSyncState(stateLabel === "ONLINE" ? "Live" : stateLabel, stateLabel === "ONLINE" ? "live" : stateLabel === "OFFLINE" ? "error" : "warn");
    setSystemWarning(stateLabel !== "ONLINE");
  });
  state.socket.on("database:update", () => {
    clearTimeout(state.guildRefreshTimer);
    state.guildRefreshTimer = setTimeout(refreshLiveDataFromRuntime, 450);
  });
  state.socket.on("config:update", payload => {
    if (payload.guild?.id !== state.guildId) return;
    if (state.pendingUpdates.size) return;
    applyGuildPayload(payload, { clearPending: true });
  });
  addEventListener("beforeunload", () => {
    state.socket?.removeAllListeners();
    state.socket?.disconnect();
  }, { once: true });
}

async function bootDashboard() {
  try {
    setLoading("Checking your secure session...");
    const session = await apiFetch("/api/auth/session");
    if (!session.user) return redirectToLogin();
    state.user = session.user;
    state.csrfToken = session.csrfToken;
    setLoading("Loading your servers...");
    renderEventGroups();
    bindNavigation();
    await Promise.all([
      settle("Health", loadHealth),
      settle("Servers", loadGuilds),
      settle("Commands", loadCommands),
      settle("Status", loadStatus)
    ]);
    bindInputs();
    setLoading("Fetching guild config...");
    if (state.guildId) await settle("Guild config", () => selectGuild(state.guildId, { replaceHistory: false, preferSocket: false, panel: state.activePanel }));
    connectSocket();
    if (!state.allGuilds.length) toast("No manageable servers found for this account.", "error");
  } catch (error) {
    console.error(error);
    toast(error.message || "Dashboard failed to load", "error");
    setSyncState("Sync Delayed", "warn");
  } finally {
    revealDashboard();
  }
}

bootDashboard();
setInterval(() => {
  if (!document.hidden && !state.pendingUpdates.size) loadHealth().catch(() => {});
}, 15000);
