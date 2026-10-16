const q = (selector, root = document) => root.querySelector(selector);
const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function safeDisplayHost() {
  const hostname = window.location.hostname || "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname === "localhost" || hostname === "127.0.0.1" || window.location.port) {
    return "16.170.133.221";
  }
  return hostname || "16.170.133.221";
}

const SOEZY_CONFIG = window.SOEZY_CONFIG || {
  publicUrl: "http://16.170.133.221",
  publicHost: "16.170.133.221",
  displayHost: safeDisplayHost(),
  apiOrigin: window.location.origin,
  socketOrigin: window.location.origin
};

document.body.classList.add("stats-loading");

function appUrl(path) {
  return new URL(path, SOEZY_CONFIG.apiOrigin || window.location.origin).toString();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[char]));
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
  if (seconds === null || seconds === undefined || seconds === "") return "--";
  const total = Number(seconds || 0);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days) return `${days}d ${hours}h`;
  if (hours) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

function setSystemWarning(visible) {
  qa("[data-system-warning], [data-bridge-warning]").forEach(element => { element.hidden = !visible; });
}

function setHealthLabel(key, online) {
  qa(`[data-health-label="${key}"]`).forEach(element => { element.textContent = online ? "Online" : "Reconnecting"; });
  qa(`[data-health-dot="${key}"]`).forEach(element => {
    element.classList.toggle("warn", !online);
    element.classList.toggle("error", false);
  });
}

qa("[data-public-host]").forEach(element => {
  element.textContent = SOEZY_CONFIG.displayHost || SOEZY_CONFIG.publicHost || "16.170.133.221";
});

function languageMenuMarkup() {
  return `
    <div class="nav-menu language-menu" data-dropdown data-language-menu>
      <button class="nav-menu-trigger language-trigger" type="button" data-menu-toggle aria-expanded="false">
        <span data-current-flag>🇬🇧</span><b data-current-language>EN</b><i>v</i>
      </button>
      <div class="nav-menu-panel language-panel" data-menu-panel>
        <button type="button" data-lang-option="EN" data-flag="🇬🇧"><span>English</span><b>🇬🇧</b></button>
        <button type="button" data-lang-option="HI" data-flag="🇮🇳"><span>Hindi</span><b>🇮🇳</b></button>
        <button type="button" data-lang-option="DE" data-flag="🇩🇪"><span>Deutsch</span><b>🇩🇪</b></button>
        <button type="button" data-lang-option="ES" data-flag="🇪🇸"><span>Español</span><b>🇪🇸</b></button>
        <button type="button" data-lang-option="FR" data-flag="🇫🇷"><span>Français</span><b>🇫🇷</b></button>
        <button type="button" data-lang-option="PT" data-flag="🇧🇷"><span>Português</span><b>🇧🇷</b></button>
        <button type="button" data-lang-option="IT" data-flag="🇮🇹"><span>Italiano</span><b>🇮🇹</b></button>
      </div>
    </div>
  `;
}

function enhanceNavLinks() {
  qa(".site-nav .nav-links").forEach(nav => {
    if (q("[data-extra-menu]", nav)) return;
    const statusLink = q('a[href="/status-page"]', nav);
    const supportLink = q('a[href="/docs"]', nav);
    const extra = document.createElement("div");
    extra.className = "nav-menu nav-extra";
    extra.dataset.dropdown = "";
    extra.dataset.extraMenu = "";
    extra.innerHTML = `
      <button class="nav-menu-trigger ${document.body.classList.contains("status-page") ? "active" : ""}" type="button" data-menu-toggle aria-expanded="false">Extra <i>v</i></button>
      <div class="nav-menu-panel extra-panel" data-menu-panel>
        <a href="/status-page"><span>~</span>Status</a>
        <a href="/#features"><span>i</span>About</a>
        <a href="/docs"><span>#</span>Documentation</a>
      </div>
    `;
    if (supportLink) nav.insertBefore(extra, supportLink);
    else nav.appendChild(extra);
    statusLink?.remove();
  });
}

function closeMenus(except = null) {
  qa("[data-dropdown].open").forEach(menu => {
    if (menu === except) return;
    menu.classList.remove("open");
    q("[data-menu-toggle]", menu)?.setAttribute("aria-expanded", "false");
  });
}

function syncLanguageMenu(code, flag) {
  qa("[data-current-language]").forEach(element => element.textContent = code);
  qa("[data-current-flag]").forEach(element => element.textContent = flag);
}

function setupNavMenus() {
  if (!document.body.classList.contains("home-page")) {
    enhanceNavLinks();
    qa(".site-nav .nav-actions").forEach(actions => {
      if (!q("[data-language-menu]", actions)) actions.insertAdjacentHTML("afterbegin", languageMenuMarkup());
    });
  }
  const savedLanguage = JSON.parse(localStorage.getItem("soezy.language") || "null");
  if (savedLanguage?.code && savedLanguage?.flag) syncLanguageMenu(savedLanguage.code, savedLanguage.flag);

  qa("[data-menu-toggle]").forEach(button => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", event => {
      event.stopPropagation();
      const menu = button.closest("[data-dropdown]");
      const isOpen = menu?.classList.contains("open");
      closeMenus(menu);
      menu?.classList.toggle("open", !isOpen);
      button.setAttribute("aria-expanded", String(!isOpen));
    });
  });
  qa("[data-lang-option]").forEach(button => {
    if (button.dataset.bound) return;
    button.dataset.bound = "true";
    button.addEventListener("click", () => {
      const code = button.dataset.langOption || "EN";
      const flag = button.dataset.flag || "🇬🇧";
      localStorage.setItem("soezy.language", JSON.stringify({ code, flag }));
      syncLanguageMenu(code, flag);
      closeMenus();
    });
  });
}

function applyBotIdentity(status = {}) {
  qa("[data-bot-name]").forEach(element => {
    element.textContent = status.botUsername || "Soezy";
  });
  qa("[data-bot-avatar]").forEach(element => {
    element.classList.toggle("verified", status.botVerified === true);
    element.title = status.botUsername || "Soezy";
    if (!status.botAvatar) {
      element.style.backgroundImage = "";
      if (!element.textContent.trim()) element.textContent = "S";
      return;
    }
    const image = new Image();
    image.onload = () => {
      element.style.backgroundImage = `url(${status.botAvatar})`;
      element.textContent = "";
      element.classList.add("has-image");
    };
    image.onerror = () => {
      element.style.backgroundImage = "";
      element.classList.remove("has-image");
      if (!element.textContent.trim()) element.textContent = "S";
    };
    image.src = status.botAvatar;
  });
}

function renderNavUser(user) {
  const target = q(".site-nav .nav-actions");
  if (!target || !user) return;
  const avatar = user.avatar ? ` style="background-image:url('${escapeHtml(user.avatar)}')"` : "";
  const initial = (user.username || "U").slice(0, 1).toUpperCase();
  target.innerHTML = `
    ${languageMenuMarkup()}
    <div class="nav-menu user-menu" data-dropdown>
      <button class="nav-user nav-menu-trigger" type="button" data-menu-toggle aria-expanded="false" title="Signed in as ${escapeHtml(user.username || "User")}" aria-label="Signed in as ${escapeHtml(user.username || "User")}">
        <i${avatar}>${user.avatar ? "" : escapeHtml(initial)}</i>
        <b>v</b>
      </button>
      <div class="nav-menu-panel user-panel" data-menu-panel>
        <a href="/dashboard"><span>□</span>Dashboard</a>
        <a class="danger" href="/logout"><span>></span>Logout</a>
      </div>
    </div>
  `;
  setupNavMenus();
}

async function hydrateNavUser() {
  try {
    const response = await fetch(appUrl("/api/auth/session"), { credentials: "same-origin" });
    if (!response.ok) return;
    const session = await response.json();
    if (session.user) renderNavUser(session.user);
  } catch {}
}
hydrateNavUser();
setupNavMenus();

document.addEventListener("click", () => closeMenus());
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMenus();
});

qa("[data-nav-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    q("[data-nav]")?.classList.toggle("open");
    q("[data-nav-actions]")?.classList.toggle("open");
  });
});

qa(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
});

const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 }) : null;
qa(".reveal").forEach(element => revealObserver ? revealObserver.observe(element) : element.classList.add("visible"));

function applyStatus(status = {}) {
  document.body.classList.remove("stats-loading");
  applyBotIdentity(status);
  const latency = status.latency ?? status.ping;
  const bridgeState = status.bridgeState || status.bridge?.state || (status.online ? "ONLINE" : "CONNECTING");
  const syncLabel = bridgeState === "ONLINE" ? (status.sync || "Internal") : bridgeState;
  qa("[data-latency]").forEach(element => element.textContent = latency === null || latency === undefined ? "--" : latency);
  qa("[data-uptime]").forEach(element => element.textContent = formatUptime(status.uptime));
  q("#statusText") && (q("#statusText").textContent = status.online ? "Global Systems Online" : "Systems Reconnecting");
  q(".home-page .eyebrow .pulse")?.classList.toggle("warn", !status.online);
  q(".home-page .eyebrow .pulse")?.classList.remove("error");
  q("[data-protection-score]") && (q("[data-protection-score]").textContent = status.online ? "94%" : "--");
  Object.entries(status).forEach(([key, value]) => {
    qa(`[data-stat="${key}"]`).forEach(element => element.textContent = typeof value === "number" ? formatNumber(value) : String(value ?? "--"));
  });
  const statusMap = {
    online: status.online ? "Online" : "Offline",
    latency: latency ?? "--",
    uptime: formatUptime(status.uptime),
    shards: status.shards ?? "--",
    clusters: status.clusters ?? "--",
    sync: syncLabel,
    guilds: formatNumber(status.guilds ?? status.servers ?? status.guildCount),
    users: formatNumber(status.users),
    commands: formatNumber(status.commands),
    memory: formatBytes(status.memory?.heapUsed || status.memory?.rss),
    cpu: Array.isArray(status.cpu?.loadavg) ? status.cpu.loadavg[0].toFixed(2) : "--"
  };
  Object.entries(statusMap).forEach(([key, value]) => {
    qa(`[data-status="${key}"]`).forEach(element => element.textContent = value);
  });
}

function applyHealth(health = {}) {
  const bot = health.bot || health;
  const bridge = health.bridge || bot.bridge || {};
  const bridgeState = health.bridgeState || bridge.state || (bot.online ? "ONLINE" : "CONNECTING");
  applyStatus({
    ...bot,
    servers: bot.servers ?? health.guilds,
    guilds: bot.servers ?? health.guilds,
    users: bot.users ?? health.users,
    commands: bot.commands ?? health.commands,
    latency: bot.latency ?? bot.ping ?? health.latency,
    uptime: bot.uptime ?? health.uptime,
    botUsername: bot.botUsername || bot.username,
    botAvatar: bot.botAvatar || bot.avatar,
    botVerified: bot.botVerified ?? bot.verified,
    bridge,
    bridgeState,
    sync: bridgeState === "ONLINE" ? "Internal" : bridgeState
  });
  const systemOnline = health.system?.online !== false && health.ok !== false;
  setSystemWarning(!systemOnline);
  setHealthLabel("bot", Boolean(bot.online));
  setHealthLabel("system", systemOnline);
  setHealthLabel("database", health.database?.ok !== false);
  setHealthLabel("api", health.api?.online !== false);
}

async function loadStatus() {
  let lastError;
  try {
    for (const endpoint of ["/api/health", "/api/stats"]) {
      try {
        const signal = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function"
          ? AbortSignal.timeout(10000)
          : undefined;
        const response = await fetch(appUrl(endpoint), { credentials: "same-origin", signal });
        if (!response.ok) {
          lastError = new Error(`Status request failed (${response.status})`);
          continue;
        }
        const payload = await response.json();
        if (!payload || typeof payload !== "object") {
          lastError = new Error("Status response was invalid");
          continue;
        }
        if (payload.bot || "servers" in payload || "guilds" in payload || "online" in payload) {
          if (payload.bot || "system" in payload || "database" in payload) applyHealth(payload);
          else applyStatus(payload);
          return;
        }
        lastError = new Error("Status response did not include bot statistics");
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("No status endpoint returned bot statistics");
  } catch {
    document.body.classList.remove("stats-loading");
    setSystemWarning(true);
    setHealthLabel("system", false);
    setHealthLabel("api", false);
    q("#statusText") && (q("#statusText").textContent = "Live data unavailable");
    q(".home-page .eyebrow .pulse")?.classList.add("error");
  }
}
if (!document.body.classList.contains("dashboard-page")) {
  loadStatus();
  setInterval(loadStatus, 15000);
}

function connectPublicStatusSocket() {
  if (document.body.classList.contains("dashboard-page") || typeof io !== "function") return;
  try {
    const socket = io(SOEZY_CONFIG.socketOrigin || window.location.origin, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 6000,
      timeout: 10000
    });
    socket.on("status:update", status => applyStatus(status || {}));
    socket.on("health:update", health => applyHealth(health || {}));
    socket.on("bridge:update", bridge => {
      setSystemWarning(bridge?.state !== "ONLINE");
    });
    addEventListener("beforeunload", () => socket.disconnect(), { once: true });
  } catch {}
}
connectPublicStatusSocket();

qa("[data-billing]").forEach(button => {
  button.addEventListener("click", () => {
    const mode = button.dataset.billing || "monthly";
    qa("[data-billing]").forEach(item => item.classList.toggle("active", item === button));
    qa(".price-card[data-month]").forEach(card => {
      const yearly = mode === "yearly";
      const price = q("[data-price]", card);
      const period = q("[data-period]", card);
      if (price) price.textContent = yearly ? card.dataset.year : card.dataset.month;
      if (period) period.textContent = yearly ? "/yr" : "/mo";
    });
  });
});

const particleCanvas = q("#particles");
if (particleCanvas) {
  const ctx = particleCanvas.getContext("2d");
  let points = [];
  function resize() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    particleCanvas.width = innerWidth * ratio;
    particleCanvas.height = innerHeight * ratio;
    particleCanvas.style.width = `${innerWidth}px`;
    particleCanvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = Array.from({ length: Math.min(92, Math.max(34, Math.floor(innerWidth / 18))) }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.7 + 0.4
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    points.forEach((point, index) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > innerWidth) point.vx *= -1;
      if (point.y < 0 || point.y > innerHeight) point.vy *= -1;
      ctx.beginPath();
      ctx.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(236, 72, 153, .5)";
      ctx.fill();
      for (let next = index + 1; next < points.length; next++) {
        const other = points[next];
        const distance = Math.hypot(point.x - other.x, point.y - other.y);
        if (distance < 124) {
          ctx.beginPath();
          ctx.moveTo(point.x, point.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.13 * (1 - distance / 124)})`;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }
  resize();
  draw();
  addEventListener("resize", resize);
}
