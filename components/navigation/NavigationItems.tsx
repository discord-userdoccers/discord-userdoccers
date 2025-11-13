import classNames from "@lib/classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { createElement, Fragment } from "react";
import Searchbar from "../Searchbar";
import { ICONS } from "./NavigationList";

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
  className?: string;
  children: React.ReactNode;
  icon: keyof typeof ICONS | null;
}

export function NavigationLink({ href, className, children, icon }: NavigationLinkProps) {
  const router = useRouter();

  const classes = classNames("flex items-center font-whitney rounded-md pl-3 gap-1", className, {
    "bg-brand-blurple text-white": router.pathname === href,
    "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
      router.pathname !== href,
  });

  const linkClasses = classNames("group flex items-center pr-2 pl-0 py-1 w-full font-medium");

  return (
    <Fragment>
      <span className={classes}>
        {icon != null && createElement(ICONS[icon], { className: "size-5 shrink-0" })}
        <Link href={href} className={linkClasses}>
          {children}
        </Link>
      </span>
    </Fragment>
  );
}

export const SearchItem = (
  <div id="searchContainer" className="w-full flex-1 sm:flex">
    <Searchbar />
  </div>
);
