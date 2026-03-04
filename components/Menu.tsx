import classNames from "@lib/classnames";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef } from "react";
import MenuContext from "../contexts/MenuContext";
import useOnClickOutside from "../hooks/useOnClickOutside";
import Bars from "./icons/Bars";
import Navigation from "./navigation/Navigation";

export default function Menu() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { open, setClose } = useContext(MenuContext);

  const classes = classNames(
    [
      // Mobile overlay only; hidden on sm and up
      "text-theme-light-text fixed -left-full pr-16 sm:pr-0 top-0 w-full h-dvh flex z-40 transition-duration-300 transform-gpu sm:hidden",
    ],
    {
      "translate-x-full ": open,
      "translate-x-none": !open,
    },
  );

  useEffect(() => {
    const handler = () => {
      if (open) {
        setClose();
      }
    };

    router.events.on("routeChangeComplete", handler);
    return () => router.events.on("routeChangeComplete", handler);
  }, [router.events, open, setClose]);

  useOnClickOutside(ref as React.RefObject<HTMLDivElement>, setClose);

  return (
    <>
      {/* Mobile overlay */}
      <div className={classes}>
        <div className="dark:bg-sidebar-tertiary-dark flex w-full flex-col bg-white" ref={ref}>
          <div className="flex grow flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-1 flex-col items-start">
              <Bars onClick={setClose} className="ml-6 h-7 cursor-pointer text-black md:hidden dark:text-white" />
              <Navigation />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop fixed sidebar */}
      <aside
        className="desktop-left-nav text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text fixed top-0 z-20 hidden h-dvh w-80 text-sm sm:block"
        aria-hidden={false}
      >
        <div className="dark:bg-sidebar-tertiary-dark flex h-full w-80 flex-col bg-white">
          <div className="flex grow flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-1 flex-col items-start">
              <Navigation />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
