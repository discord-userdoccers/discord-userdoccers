import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export default function useTheme() {
  const [theme, _setTheme] = useState<Theme>("system");

  const getSystemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

  const applyTheme = (toApply: Theme) => {
    if ((toApply === "system" ? getSystemTheme() : toApply) === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }

  useEffect(() => {
    applyTheme(theme);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  useEffect(() => {
    _setTheme((window.localStorage.getItem("theme") ?? "system") as Theme);

    const match = window?.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => { applyTheme(e.matches ? "dark" : "light") }
    match.addEventListener('change', onChange)
    return () => match.removeEventListener('change', onChange)
  }, [])

  const setTheme = (theme: Theme) => {
    _setTheme(theme);
    window.localStorage.setItem("theme", theme);
  };

  return [theme, setTheme] as const;
}
