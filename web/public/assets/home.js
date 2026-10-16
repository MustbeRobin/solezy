(() => {
  const placeholder = "--";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $$ = selector => document.querySelectorAll(selector);
  const setText = (selector, value) => $$(selector).forEach(element => { element.textContent = value; });

  const readableNumber = value => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? numeric.toLocaleString("en-US") : placeholder;
  };
  const readableLatency = value => {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= 0 ? `${Math.round(numeric)} ms` : placeholder;
  };
  const readableUptime = seconds => {
    const total = Number(seconds);
    if (!Number.isFinite(total) || total < 0) return placeholder;
    const days = Math.floor(total / 86400);
    const hours = Math.floor((total % 86400) / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    if (days) return `${days}d ${hours}h`;
    if (hours) return `${hours}h ${minutes}m`;
    return `${Math.max(1, minutes)}m`;
  };
  const botAvatarUrl = stats => stats?.botAvatar || stats?.avatar || "";

  /* ── animated counters ─────────────────────────────── */
  const counters = new WeakMap();
  function animateNumber(element, target, format) {
    const previous = counters.get(element);
    if (previous?.frame) cancelAnimationFrame(previous.frame);
    const from = previous?.value ?? 0;
    if (reduceMotion || from === target) {
      element.textContent = format(target);
      counters.set(element, { value: target });
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const state = { value: from, frame: 0 };
    counters.set(element, state);
    const tick = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress); // easeOutExpo
      state.value = Math.floor(from + (target - from) * eased);
      element.textContent = format(progress === 1 ? target : state.value);
      if (progress < 1) state.frame = requestAnimationFrame(tick);
      else state.value = target;
    };
    state.frame = requestAnimationFrame(tick);
  }
  function setStat(key, raw, format, online) {
    const numeric = Number(raw);
    $$(`[data-stat=${key}]`).forEach(element => {
      if (!online || !Number.isFinite(numeric) || numeric < 0) {
        const previous = counters.get(element);
        if (previous?.frame) cancelAnimationFrame(previous.frame);
        counters.delete(element);
        element.textContent = placeholder;
        return;
      }
      animateNumber(element, numeric, format);
    });
  }

  /* ── avatars / status ──────────────────────────────── */
  function setAvatar(selector, fallbackSelector, url, fallback = "S") {
    const image = document.querySelector(selector);
    const fallbackNode = document.querySelector(fallbackSelector);
    if (!image || !fallbackNode) return;
    fallbackNode.textContent = fallback.slice(0, 1).toUpperCase();
    if (!url) return;
    image.src = url;
    image.hidden = false;
    fallbackNode.hidden = true;
    image.addEventListener("error", () => {
      image.hidden = true;
      fallbackNode.hidden = false;
    }, { once: true });
  }

  function setStatus(online) {
    const dot = document.querySelector("[data-status-dot]");
    const pill = document.querySelector("[data-status-pill]");
    if (dot) dot.classList.toggle("online", online);
    if (pill) pill.classList.toggle("online", online);
    setText("[data-status-label]", online ? "Global systems online" : "Connection unavailable");
    setText("[data-status-pill-label]", online ? "Live" : "Unavailable");
  }

  async function readJson(url) {
    const response = await fetch(url, { credentials: "same-origin", cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || "Request failed");
    return data;
  }

  async function loadStats() {
    try {
      const stats = await readJson("/api/stats");
      const name = stats.botUsername || "Soezy";
      const online = stats.online === true;
      setText("[data-bot-name]", name);
      setStat("servers", stats.guildCount ?? stats.servers, readableNumber, online);
      setStat("users", stats.userCount ?? stats.users, readableNumber, online);
      setStat("commands", stats.commands, readableNumber, online);
      setStat("latency", stats.latency ?? stats.ping, readableLatency, online);
      setStat("uptime", stats.uptime, readableUptime, online);
      setStat("shards", stats.shards, readableNumber, online);
      setStat("clusters", stats.clusters, readableNumber, online);
      setAvatar("[data-bot-avatar]", "[data-bot-fallback]", botAvatarUrl(stats), name);
      setAvatar("[data-hero-bot-avatar]", "[data-hero-bot-fallback]", botAvatarUrl(stats), name);
      setStatus(online);
    } catch {
      setStatus(false);
      ["servers", "users", "commands", "latency", "uptime", "shards", "clusters"].forEach(key => setStat(key, null, readableNumber, false));
      setAvatar("[data-bot-avatar]", "[data-bot-fallback]", "", "Soezy");
      setAvatar("[data-hero-bot-avatar]", "[data-hero-bot-fallback]", "", "Soezy");
    }
  }

  async function loadPage() {
    let session = null;
    try { session = await readJson("/api/auth/session"); } catch {}
    const loggedIn = Boolean(session?.user?.id);
    const accountLink = document.querySelector("[data-account-link]");
    const dashboardLink = document.querySelector("[data-dashboard-link]");
    if (accountLink) {
      accountLink.href = loggedIn ? "/dashboard" : "/login";
      accountLink.textContent = loggedIn ? "Dashboard" : "Log in";
    }
    if (dashboardLink) dashboardLink.href = loggedIn ? "/dashboard" : "/login?next=%2Fdashboard";
    await loadStats();
    setInterval(() => { if (!document.hidden) loadStats(); }, 30000);
  }

  /* ── dropdowns + language ──────────────────────────── */
  function closeMenus(except = null) {
    $$("[data-dropdown].open").forEach(menu => {
      if (menu === except) return;
      menu.classList.remove("open");
      menu.querySelector("[data-menu-toggle]")?.setAttribute("aria-expanded", "false");
    });
  }
  $$("[data-menu-toggle]").forEach(button => button.addEventListener("click", event => {
    event.stopPropagation();
    const menu = button.closest("[data-dropdown]");
    const open = menu.classList.contains("open");
    closeMenus(menu);
    menu.classList.toggle("open", !open);
    button.setAttribute("aria-expanded", String(!open));
  }));
  document.addEventListener("click", () => closeMenus());
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenus(); });

  try {
    const saved = JSON.parse(localStorage.getItem("soezy.language") || "null");
    if (saved?.code && saved?.flag) {
      setText("[data-current-language]", saved.code);
      setText("[data-current-flag]", saved.flag);
    }
  } catch {}
  $$("[data-lang-option]").forEach(button => button.addEventListener("click", () => {
    const code = button.dataset.langOption || "EN";
    const flag = button.dataset.flag || "🇬🇧";
    try { localStorage.setItem("soezy.language", JSON.stringify({ code, flag })); } catch {}
    setText("[data-current-language]", code);
    setText("[data-current-flag]", flag);
    closeMenus();
  }));

  /* ── mobile menu ───────────────────────────────────── */
  const menuButton = document.querySelector("[data-menu-toggle-mobile]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      const open = mobileMenu.hidden;
      mobileMenu.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    mobileMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      mobileMenu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    }));
  }

  /* ── navbar blur on scroll ─────────────────────────── */
  const nav = document.querySelector("[data-nav]");
  const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });

  /* ── scroll reveal ─────────────────────────────────── */
  const revealTargets = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(element => observer.observe(element));
  } else {
    revealTargets.forEach(element => element.classList.add("in"));
  }

  /* ── cursor effects: hero spotlight + card glow ────── */
  const hero = document.querySelector(".hero-section");
  const spotlight = document.querySelector("[data-spotlight]");
  if (hero && spotlight && !reduceMotion) {
    hero.addEventListener("pointermove", event => {
      const rect = hero.getBoundingClientRect();
      spotlight.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      spotlight.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  }
  $$(".metric-card").forEach(card => {
    const scan = document.createElement("span");
    scan.className = "scan";
    scan.setAttribute("aria-hidden", "true");
    card.prepend(scan);
    if (reduceMotion) return;
    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  loadPage();
})();
