export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
}

export function applyTheme(theme: Theme | null) {
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

export function storeTheme(theme: Theme | null) {
  if (theme) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } else {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
  }
}

// Se inyecta inline en <head> para fijar el tema antes del primer paint
// y evitar el flash del tema equivocado mientras React hidrata.
export const applyStoredThemeScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (stored === "light" || stored === "dark") {
      document.documentElement.setAttribute("data-theme", stored);
    }
  } catch (e) {}
})();
`;
