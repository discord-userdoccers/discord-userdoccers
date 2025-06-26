import { createContext, useContext, useEffect, useState } from "react";

const HashContext = createContext<string>("");

export function HashProvider({ children }: { children: React.ReactNode }) {
  const [hash, setHash] = useState<string>(typeof window !== "undefined" ? window.location.hash : "");

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);

    window.addEventListener("hashchange", handleHashChange); // Better compatibility

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return <HashContext.Provider value={hash}>{children}</HashContext.Provider>;
}

export const useHash = () => useContext(HashContext);
