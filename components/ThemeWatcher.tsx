import { useTheme } from "next-themes";
import { useEffect } from "react";

export function ThemeWatcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;

    // When "amoled" is active, we force the "dark" class as well to ensure
    // external libraries (like DocSearch) pick up the dark theme
    // next-themes handles the data-theme attribute via the value prop in _app.tsx
    if (resolvedTheme === "amoled") {
      document.documentElement.classList.add("amoled");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("amoled");
      document.documentElement.classList.remove("dark");
    }
  }, [resolvedTheme]);

  return null;
}
