(() => {
  const state = { user: null, csrfToken: "", guilds: [], summary: {}, filter: "all", query: "", bridgeState: "OFFLINE" };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);

  const ACCENTS = [
    ["#f43f5e", "#db2777"], ["#0ea5e9", "#1d4ed8"], ["#fb923c", "#d97706"], ["#818cf8", "#6d28d9"],
    ["#64748b", "#1e293b"], ["#fcd34d", "#ca8a04"], ["#a1a1aa", "#3f3f46"], ["#22d3ee", "#0f766e"],
    ["#34d399", "#15803d"], ["#e879f9", "#a21caf"]
  ];
  function accentFor(id = "") {
    let hash = 0;
    for (const char of String(id)) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return ACCENTS[hash % ACCENTS.length];
  }

  async function getJson(url, options = {}) {
    const response = await fetch(url, { credentials: "same-origin", ...options });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      location.assign(`/login?next=${encodeURIComponent("/dashboard")}`);
      throw new Error("Login required");
    }
    if (!response.ok || data.ok === false) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  }

  /* animated number */
  const counters = new WeakMap();
  function setCount(element, value) {
    if (!element) return;
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) { element.textContent = "--"; counters.delete(element); return; }
    const previous = counters.get(element);
    if (previous?.frame) cancelAnimationFrame(previous.frame);
    const from = previous?.value ?? 0;
    if (reduceMotion || from === numeric) { element.textContent = String(numeric); counters.set(element, { value: numeric }); return; }
    const start = performance.now();
    const duration = 1100;
    const record = { value: from, frame: 0 };
    counters.set(element, record);
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      record.value = Math.round(from + (numeric - from) * eased);
      element.textContent = String(record.value);
      if (progress < 1) record.frame = requestAnimationFrame(tick);
    };
    record.frame = requestAnimationFrame(tick);
  }

  function avatarUrl(user, size = 128) {
    if (!user?.id || !user.avatar) return "";
    const extension = String(user.avatar).startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${encodeURIComponent(user.id)}/${encodeURIComponent(user.avatar)}.${extension}?size=${size}`;
  }

  function applyUser(user) {
    state.user = user || {};
    const name = user?.global_name || user?.username || "Discord user";
    const avatar = avatarUrl(user, 128);
    $$("[data-user-name]").forEach(element => { element.textContent = name; });
    $$("[data-display-name]").forEach(element => { element.textContent = name; });
    const fallback = $("[data-profile-fallback]");
    fallback.textContent = name.slice(0, 1).toUpperCase();
    const topAvatar = $("[data-user-avatar]");
    for (const image of [$("[data-profile-avatar]"), topAvatar]) {
      if (!avatar || !image) continue;
      image.src = avatar;
      image.hidden = false;
      image.addEventListener("error", () => {
        image.hidden = true;
        if (image.matches("[data-profile-avatar]")) fallback.hidden = false;
      }, { once: true });
    }
    if (avatar) fallback.hidden = true;
  }

  function bindIconFallbacks(root) {
    $$("img", root).forEach(image => image.addEventListener("error", () => {
      const fallback = image.nextElementSibling;
      image.remove();
      if (fallback) fallback.hidden = false;
    }, { once: true }));
  }

  function guildIcon(guild) {
    const name = escapeHtml(guild.name || "Server");
    const initial = escapeHtml((guild.name || "S").trim().slice(0, 1).toUpperCase() || "S");
    const url = guild.iconUrl || guild.icon;
    const [a1, a2] = accentFor(guild.id);
    const style = `style="--a1:${a1};--a2:${a2}"`;
    return url
      ? `<span class="guild-icon" ${style}><img src="${escapeHtml(url)}" alt="${name}" loading="lazy"><span hidden>${initial}</span>`
      : `<span class="guild-icon" ${style} aria-label="${name}">${initial}`;
  }

  function roleBadge(guild) {
    if (guild.owner) return `<span class="role-badge owner">👑 OWNER</span>`;
    return `<span class="role-badge">${guild.isAdmin ? "🛡 ADMIN" : "⚙ MANAGE SERVER"}</span>`;
  }

  const GEAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
  const PLUS = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>`;

  function cardAction(guild, presenceKnown) {
    if (!presenceKnown || state.bridgeState !== "ONLINE") {
      return `<button class="card-action" type="button" disabled title="Bot connection unavailable">Connection unavailable</button>`;
    }
    if (guild.botPresent) {
      return `<a class="card-action" href="/dashboard/${encodeURIComponent(guild.id)}">${GEAR} Configure</a>`;
    }
    return `<a class="card-action secondary" href="/invite?guild_id=${encodeURIComponent(guild.id)}">${PLUS} Add Bot to Server</a>`;
  }

  /* tilt + cursor glow */
  function enhanceCard(card) {
    card.addEventListener("animationend", () => {
      card.style.animation = "none";
      card.style.opacity = "1";
      card.style.transform = "";
    }, { once: true });
    if (reduceMotion) return;
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      card.style.setProperty("--mx", `${px}px`);
      card.style.setProperty("--my", `${py}px`);
      const rx = -((py - rect.height / 2) / (rect.height / 2)) * 6;
      const ry = ((px - rect.width / 2) / (rect.width / 2)) * 6;
      if (card.style.animationName === "none" || card.style.animation === "none") {
        card.style.transition = "transform .08s linear, border-color .3s";
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
    });
    card.addEventListener("pointerleave", () => {
      card.style.transition = "transform .45s cubic-bezier(.22,1,.36,1), border-color .3s";
      card.style.transform = "";
    });
  }

  function renderGuilds() {
    const grid = $("[data-server-grid]");
    const presenceKnown = state.bridgeState === "ONLINE" && state.guilds.every(guild => guild.botPresenceKnown !== false);
    const filtered = state.guilds.filter(guild => {
      const matchesQuery = String(guild.name || "").toLowerCase().includes(state.query);
      const matchesFilter = state.filter === "all" || (presenceKnown && (state.filter === "installed" ? guild.botPresent : !guild.botPresent));
      return matchesQuery && matchesFilter;
    });

    if (!state.guilds.length) {
      grid.innerHTML = `<div class="empty-state"><strong>No manageable servers found</strong><p>Make sure your Discord account can manage a server, then refresh.</p></div>`;
      return;
    }
    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state"><strong>No matching servers</strong><p>Try another search or filter.</p></div>`;
      return;
    }

    grid.innerHTML = filtered.map((guild, index) => {
      const known = presenceKnown && guild.botPresenceKnown !== false;
      const botPresent = known && guild.botPresent === true;
      const botState = known
        ? `<span class="bot-state ${botPresent ? "installed" : "missing"}">${botPresent ? "BOT INSTALLED" : "NOT INSTALLED"}</span>`
        : `<span class="bot-state unknown">STATUS UNKNOWN</span>`;
      return `<article class="server-card" style="--i:${Math.min(index, 14)}">
        <span class="glow-follow" aria-hidden="true"></span><span class="sheen" aria-hidden="true"></span>
        <div class="card-body">
          ${guildIcon(guild)}${botPresent ? `<i class="dot"></i>` : ""}</span>
          <h3 title="${escapeHtml(guild.name || "Server")}">${escapeHtml(guild.name || "Server")}</h3>
          <div class="role-row">${roleBadge(guild)}${botState}</div>
          ${cardAction(guild, known)}
        </div>
      </article>`;
    }).join("");
    bindIconFallbacks(grid);
    $$(".server-card", grid).forEach(enhanceCard);
  }

  function render(data) {
    state.guilds = Array.isArray(data.allGuilds) ? data.allGuilds : [];
    state.summary = data.summary || {};
    state.bridgeState = String(data.bridgeState || "OFFLINE").toUpperCase();
    setCount($("[data-total]"), state.summary.total ?? state.guilds.length);
    setCount($("[data-owned]"), state.summary.owned ?? state.guilds.filter(guild => guild.owner).length);
    if (state.bridgeState === "ONLINE" && data.botPresenceKnown !== false) {
      setCount($("[data-installed]"), state.summary.withBot ?? state.guilds.filter(guild => guild.botPresent).length);
    } else {
      setCount($("[data-installed]"), NaN);
    }
    $("[data-bridge-notice]").hidden = state.bridgeState === "ONLINE";
    $("[data-server-caption]").textContent = state.guilds.length
      ? `${state.guilds.length} server${state.guilds.length === 1 ? "" : "s"} you can manage — select one to configure Soezy.`
      : "Servers you can manage will appear here.";

    const rail = $("[data-server-rail]");
    rail.innerHTML = state.guilds.map((guild, index) => {
      const name = escapeHtml(guild.name || "Server");
      const icon = guild.iconUrl || guild.icon;
      const initial = escapeHtml((guild.name || "S").slice(0, 1).toUpperCase());
      const href = guild.botPresent && state.bridgeState === "ONLINE" ? `/dashboard/${encodeURIComponent(guild.id)}` : `/invite?guild_id=${encodeURIComponent(guild.id)}`;
      const [a1, a2] = accentFor(guild.id);
      return `<a class="rail-server" style="--i:${Math.min(index, 20)};background:linear-gradient(135deg,${a1},${a2})" href="${href}" title="${name}">${icon ? `<img src="${escapeHtml(icon)}" alt="" loading="lazy"><span hidden>${initial}</span>` : `<span>${initial}</span>`}</a>`;
    }).join("");
    bindIconFallbacks(rail);
    renderGuilds();
  }

  function setLoadState(message, isError = false) {
    const element = $("[data-load-state]");
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.hidden = false;
    $("[data-server-grid]").hidden = true;
  }

  async function loadDashboard() {
    const refresh = $("[data-refresh]");
    refresh.disabled = true;
    refresh.classList.add("loading");
    setLoadState("Loading your servers…");
    try {
      const session = await getJson("/api/auth/session");
      if (!session.user?.id) {
        location.assign(`/login?next=${encodeURIComponent("/dashboard")}`);
        return;
      }
      state.csrfToken = session.csrfToken || "";
      applyUser(session.user);
      const guildData = await getJson("/api/guilds");
      $("[data-load-state]").hidden = true;
      $("[data-server-grid]").hidden = false;
      render(guildData);
    } catch (error) {
      setLoadState(error.message || "Could not load your servers. Please try again.", true);
    } finally {
      refresh.disabled = false;
      refresh.classList.remove("loading");
    }
  }

  $("[data-refresh]").addEventListener("click", loadDashboard);
  $("[data-search]").addEventListener("input", event => {
    state.query = event.currentTarget.value.trim().toLowerCase();
    renderGuilds();
  });
  $$("[data-filter]").forEach(button => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    $$("[data-filter]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    renderGuilds();
  }));
  $("[data-logout]").addEventListener("click", async event => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await getJson("/api/auth/logout", { method: "POST", headers: { "X-CSRF-Token": state.csrfToken } });
      location.assign("/login");
    } catch (error) {
      button.disabled = false;
      setLoadState(error.message || "Could not log out. Please try again.", true);
    }
  });

  loadDashboard();
})();
