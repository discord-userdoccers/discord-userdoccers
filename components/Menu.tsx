import React, { useContext, useEffect, useRef } from "react";
import classNames from "classnames";
import Bars from "./icons/Bars";
import Navigation from "./Navigation";
import MenuContext from "../contexts/MenuContext";
import useOnClickOutside from "../hooks/useOnClickOutside";
import { useRouter } from "next/router";

export default function Menu() {
  const ref = useRef();
  const router = useRouter();
  const { open, setClose } = useContext(MenuContext);

  const classes = classNames(
    [
      "text-theme-light-text absolute -left-full pr-16 md:pr-0 top-0 w-full h-full flex z-40 transition-transform duration-300 transform-gpu",
      "md:flex md:flex-shrink-0 md:left-auto md:relative md:w-auto md:transform-none md:transition-none",
    ],
    {
      "translate-x-full ": open,
      "translate-x-none md:flex": !open,
    }
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

  useOnClickOutside(ref, setClose);

  return (
    <div className={classes}>
      <div
        className="flex flex-col w-full dark:bg-sidebar-tertiary-dark bg-sidebar-tertiary-light md:w-80"
        ref={ref}
      >
        <div className="flex flex-col flex-grow pb-4 pt-5 overflow-y-auto">
          <div className="flex flex-1 flex-col items-start">
            <Bars
              onClick={setClose}
              className="ml-6 h-7 text-black dark:text-white cursor-pointer md:hidden"
            />
            <Navigation />
          </div>
        </div>
      </div>
    </div>
  );
}
