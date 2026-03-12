import "./stylesheets/tailwind.css";
import "./stylesheets/styles.css";
import "./stylesheets/scrollbar.css";
import "./stylesheets/whitney/whitney.css";
import "./stylesheets/prism.css";
import "./stylesheets/youtube.css";
import "./stylesheets/snowflake-deconstruction.css";

import { ViteReactSSG } from "vite-react-ssg";
import { Outlet } from "react-router-dom";
import routes from "~react-pages";

import classNames from "@lib/classnames";
import { ThemeProvider } from "next-themes";
import { useCallback, useState } from "react";

import Footer from "./components/Footer";
import MDX from "./components/MDX";
import Menu from "./components/Menu";
import MenuContext from "./contexts/MenuContext";
import "@docsearch/css";
import { CodegenLanguageProvider } from "./lib/type-generator/store";
import OnThisPage from "./components/OnThisPage";
import { ThemeWatcher } from "./components/ThemeWatcher";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const setOpen = useCallback(() => setSidebarOpen(true), []);
  const setClose = useCallback(() => setSidebarOpen(false), []);

  const fadeClasses = classNames("sidebar-fade", {
    "open": sidebarOpen,
    "closed": !sidebarOpen,
  });

  const component = (
    <CodegenLanguageProvider>
      <MDX>
        <Outlet />
      </MDX>
    </CodegenLanguageProvider>
  );

  return (
    <>
      <ThemeProvider
        defaultTheme="system"
        attribute="data-theme"
        themes={["light", "dark", "amoled"]}
        value={{
          light: "light",
          dark: "dark",
          amoled: "dark",
        }}
      >
        <MenuContext.Provider value={{ open: sidebarOpen, setOpen, setClose }}>
          <ThemeWatcher />
          <div className="app-wrapper">
            <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
            <Menu />
            {component}
            <OnThisPage />
          </div>
          <Footer />
        </MenuContext.Provider>
      </ThemeProvider>
    </>
  );
}

export const createRoot = ViteReactSSG({
  routes: [
    {
      path: "/",
      element: <App />,
      children: routes,
    },
  ],
});
