import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

type BarState = "idle" | "loading" | "completing";

// Module-level singleton: patches history once and notifies all mounted bars
const navListeners = new Set<() => void>();
let historyPatched = false;

function patchHistory() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  const notify = () => navListeners.forEach((fn) => fn());

  const origPush = history.pushState.bind(history);
  history.pushState = (...args) => {
    notify();
    origPush(...args);
  };

  const origReplace = history.replaceState.bind(history);
  history.replaceState = (...args) => {
    notify();
    origReplace(...args);
  };

  window.addEventListener("popstate", notify);
}

export default function LoadingBar() {
  const location = useLocation();
  const [state, setState] = useState<BarState>("idle");
  const doneTimer = useRef<ReturnType<typeof setTimeout>>();
  const isNavigating = useRef(false);

  useEffect(() => {
    patchHistory();

    const onStart = () => {
      clearTimeout(doneTimer.current);
      isNavigating.current = true;
      setState("loading");
    };

    navListeners.add(onStart);
    return () => {
      navListeners.delete(onStart);
    };
  }, []);

  // Complete bar when React Router has applied the new location
  useEffect(() => {
    if (!isNavigating.current) return;
    isNavigating.current = false;
    setState("completing");
    doneTimer.current = setTimeout(() => setState("idle"), 600);
    return () => clearTimeout(doneTimer.current);
  }, [location.key]);

  return (
    <div
      className="bg-brand-blurple pointer-events-none fixed top-0 right-0 left-0 z-[9999] h-[3px]"
      style={{
        transformOrigin: "0% 50%",
        transform: state === "completing" ? "scaleX(1)" : state === "loading" ? "scaleX(0.85)" : "scaleX(0)",
        opacity: state === "loading" ? 1 : 0,
        transition:
          state === "loading"
            ? "transform 2s cubic-bezier(0.05, 0.35, 0.3, 0.95), opacity 0.1s"
            : state === "completing"
              ? "transform 0.2s ease-out, opacity 0.4s ease 0.15s"
              : "none",
      }}
    />
  );
}
