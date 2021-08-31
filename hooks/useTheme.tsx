import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function apply(theme: Theme) {
  const value = theme === "system" ? getSystemTheme() : theme;
  if (value === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    return window.localStorage.getItem("theme") as Theme;
  });

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
    apply(theme);
  }, [theme]);

  useEffect(() => {
    const match = window?.matchMedia("(prefers-color-scheme: dark)");

    const onChange = (e: MediaQueryListEvent) => {
      apply(e.matches ? "dark" : "light");
    };

    match.addEventListener("change", onChange);
    return () => match.removeEventListener("change", onChange);
  }, []);

  return [theme, setTheme] as const;
}
