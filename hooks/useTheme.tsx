import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

const getSystemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"

const applyTheme = (toApply: Theme) => {
  const themeToApply = toApply === "system" ? getSystemTheme() : toApply
  if (themeToApply === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>((window.localStorage.getItem("theme") ?? "system") as Theme);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme])

  useEffect(() => {
    setTheme((window.localStorage.getItem("theme") ?? "system") as Theme);

    const match = window?.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => { applyTheme(e.matches ? "dark" : "light") }
    match.addEventListener('change', onChange)
    return () => match.removeEventListener('change', onChange)
  }, [])

  return [theme, setTheme] as const;
}
