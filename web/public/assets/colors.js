window.SOEZY_THEME = {
  colors: {
    primary: "#5865F2",
    violet: "#8B5CF6",
    pink: "#EC4899",
    navy: "#0F172A",
    ink: "#05060D",
    panel: "rgba(15, 23, 42, 0.72)",
    line: "rgba(148, 163, 184, 0.16)",
    success: "#22C55E",
    warning: "#F59E0B",
    danger: "#F43F5E"
  },
  gradients: {
    hero: "linear-gradient(135deg, #5865F2 0%, #8B5CF6 48%, #EC4899 100%)",
    danger: "linear-gradient(135deg, #F43F5E 0%, #EC4899 52%, #8B5CF6 100%)",
    calm: "linear-gradient(135deg, #22C55E 0%, #14B8A6 48%, #5865F2 100%)"
  }
};

for (const [key, value] of Object.entries(window.SOEZY_THEME.colors)) {
  document.documentElement.style.setProperty(`--theme-${key}`, value);
}
