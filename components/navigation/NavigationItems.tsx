import classNames from "@lib/classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import useToggle from "../../hooks/useToggle";
import Caret from "../icons/Caret";
import CaretFill from "../icons/CaretFill";
import Searchbar from "../Searchbar";

interface MenuSelectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function NavigationSection({ title, className, children }: MenuSelectionProps) {
  const classes = classNames("mb-6", className);

  return (
    <section className={classes}>
      {title ? (
        <h3 className="mb-2 ml-2 font-whitney-bold text-xs uppercase text-black dark:text-white">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}

interface NavigationLinkProps {
  href: string;
  subLinks?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function NavigationLink({ href, subLinks, className, children }: NavigationLinkProps) {
  const router = useRouter();
  const { value: isOpen, toggle } = useToggle(router.pathname === href);

  // TODO: We currently have a bunch of listeners being added here - can this be improved?
  useEffect(() => {
    const handler = (url: string) => {
      if (url.endsWith(href) && !isOpen) {
        toggle();
      }
    };

    router.events.on("routeChangeComplete", handler);
    return () => router.events.off("routeChangeComplete", handler);
  });

  const classes = classNames("flex items-center font-whitney rounded-md", className, {
    "bg-brand-blurple text-white": router.pathname === href,
    "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
      router.pathname !== href,
  });

  const caretClasses = classNames("w-4 h-4", {
    "rotate-90": isOpen,
  });

  const linkClasses = classNames("group flex items-center px-2 py-1 w-full font-medium", {
    "ml-6": subLinks == null,
  });

  return (
    <Fragment>
      <span className={classes}>
        {subLinks != null && (
          <button onClick={toggle} className="pl-2">
            <CaretFill className={caretClasses} />
          </button>
        )}
        <Link href={href} className={linkClasses}>
          {children}
        </Link>
      </span>
      {isOpen && subLinks != null ? subLinks : null}
    </Fragment>
  );
}

interface NavigationSubLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavigationSubLink({ href, children }: NavigationSubLinkProps) {
  const router = useRouter();

  const [currentPath, setPath] = useState("");

  const classes = classNames("group flex items-center ml-6 px-2 py-1 w-full text-sm font-medium rounded-md", {
    "text-dark dark:text-white": currentPath === href,
    "text-theme-light-sidebar-text hover:text-theme-light-sidebar-hover-text dark:hover:text-white":
      currentPath !== href,
  });

  useEffect(() => {
    setPath(router.asPath);
  }, [router.asPath]);

  return (
    <span className="relative ml-4 flex items-center">
      <Link href={href} className={classes}>
        {currentPath === href ? <Caret className="absolute -ml-4 h-2 w-2" /> : null}
        {children}
      </Link>
    </span>
  );
}

export const SearchItem = (
  <div id="searchContainer" className="flex w-full flex-1">
    <Searchbar />
  </div>
);
