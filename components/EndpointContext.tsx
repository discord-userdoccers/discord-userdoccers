import React, { createContext, useContext, useState } from "react";

export interface EndpointFilters {
  search: string;
  showBot: boolean;
  showOAuth2: boolean;
  showUnauthenticated: boolean;
}

interface EndpointContextType extends EndpointFilters {
  setSearch: (value: string) => void;
  setShowBot: (value: boolean) => void;
  setShowOAuth2: (value: boolean) => void;
  setShowUnauthenticated: (value: boolean) => void;
  updateFilter: (update: Partial<EndpointFilters>) => void;
}

const EndpointContext = createContext<EndpointContextType>({
  search: "",
  showBot: false,
  showOAuth2: false,
  showUnauthenticated: false,
  setSearch: () => {},
  setShowBot: () => {},
  setShowOAuth2: () => {},
  setShowUnauthenticated: () => {},
  updateFilter: () => {},
});

export const useEndpointContext = () => useContext(EndpointContext);

export const EndpointProvider = ({ children }: { children: React.ReactNode }) => {
  const [search, setSearch] = useState("");
  const [showBot, setShowBot] = useState(false);
  const [showOAuth2, setShowOAuth2] = useState(false);
  const [showUnauthenticated, setShowUnauthenticated] = useState(false);

  const updateFilter = (update: Partial<EndpointFilters>) => {
    if (update.search !== undefined) setSearch(update.search);
    if (update.showBot !== undefined) setShowBot(update.showBot);
    if (update.showOAuth2 !== undefined) setShowOAuth2(update.showOAuth2);
    if (update.showUnauthenticated !== undefined) setShowUnauthenticated(update.showUnauthenticated);
  };

  return (
    <EndpointContext.Provider
      value={{
        search,
        showBot,
        showOAuth2,
        showUnauthenticated,
        setSearch,
        setShowBot,
        setShowOAuth2,
        setShowUnauthenticated,
        updateFilter,
      }}
    >
      {children}
    </EndpointContext.Provider>
  );
};
