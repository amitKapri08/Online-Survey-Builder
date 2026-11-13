(function () {
  try {
    var stored = localStorage.getItem("surveyhub-theme");
    var prefersDark =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    var isDark =
      stored === "dark" || ((!stored || stored === "system") && prefersDark);

    document.documentElement.classList.toggle("dark", isDark);
  } catch (error) {
    // Ignore storage/matchMedia failures (private browsing, old browsers).
  }
})();
