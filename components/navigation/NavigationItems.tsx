import classNames from "@lib/classnames";
import React, { createElement } from "react";
import { NavLink } from "react-router-dom";
import { ICONS } from "./NavigationList";
import SearchTrigger from "../SearchTrigger";

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
        <h3 className="font-whitney-bold mb-2 ml-2 text-xs text-black uppercase dark:text-white">{title}</h3>
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
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        classNames("font-whitney flex items-center gap-1 rounded-md pl-3", className, {
          "bg-brand-blurple text-white": isActive,
          "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
            !isActive,
        })
      }
    >
      {icon != null && createElement(ICONS[icon], { className: "size-5 shrink-0" })}
      <span className="group flex w-full items-center py-1 pr-2 pl-0 font-medium">{children}</span>
    </NavLink>
  );
}

export const SearchItem = (
  <div className="mb-4 w-full">
    <SearchTrigger />
  </div>
);
