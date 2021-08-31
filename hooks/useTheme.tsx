import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export default function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "system";
    }

    const theme = localStorage.getItem("theme");

    if (theme === "dark" || theme === "light") {
      return theme;
    }

    return "system";
  });

  const setDark = () => {
    window.document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  };

  useEffect(() => {
    const root = window.document.documentElement;
    switch (theme) {
      case "dark":
        setDark();
        break;
      case "light":
        root.classList.remove("dark");
        localStorage.setItem("theme", theme);
        break;
      case "system":
      default:
        localStorage.removeItem("theme");
        if (window?.matchMedia("(prefers-color-scheme: dark)")?.matches) {
          root.classList.add("dark");
        }
    }
  }, [theme]);

  useEffect(() => {
    const query = window?.matchMedia("(prefers-color-scheme: dark)");

    const handler = (event) => {
      if (theme !== "system") {
        return;
      }

      if (event.matches) {
        window.document.documentElement.classList.add("dark");
      } else {
        window.document.documentElement.classList.remove("dark");
      }
    };

    query?.addEventListener("change", handler);

    return () => query?.removeEventListener("change", handler);
  }, [theme]);

  return [theme, setTheme];
}
