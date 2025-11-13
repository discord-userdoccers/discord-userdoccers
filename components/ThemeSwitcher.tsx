import { Menu, Transition } from "@headlessui/react";
import classNames from "@lib/classnames";
import { useTheme } from "next-themes";
import { Fragment, useCallback } from "react";
import Check from "./icons/Check";
import Gear from "./icons/Gear";
import Lightbulb from "./icons/Lightbulb";
import Moon from "./icons/Moon";
import Sun from "./icons/Sun";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const getMenuItemClasses = useCallback(
    (active: boolean) =>
      classNames("group flex items-center px-2 py-2 w-full text-sm rounded-md", {
        "bg-brand-blurple text-white": active,
        "text-gray-900 dark:text-theme-dark-sidebar-text": !active,
      }),
    [],
  );

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className="inline-flex w-full justify-center rounded-md bg-sidebar-tertiary-light p-2 text-sm font-medium text-black transition duration-100 hover:bg-brand-blurple hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75 dark:bg-sidebar-secondary-dark dark:text-white dark:hover:bg-brand-blurple"
          aria-label="Change Theme"
        >
          <Lightbulb className="h-4 w-4 md:h-6 md:w-6" aria-hidden="true" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-40 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-sidebar-tertiary-light shadow-lg ring-1 ring-brand-blurple ring-opacity-5 focus:outline-none dark:divide-gray-900 dark:bg-sidebar-secondary-dark">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button className={getMenuItemClasses(active)} onClick={() => setTheme("system")}>
                  {theme === "system" ? (
                    <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Gear className="mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  System Theme
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button className={getMenuItemClasses(active)} onClick={() => setTheme("light")}>
                  {theme === "light" ? (
                    <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Sun className="mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  Light Theme
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button className={getMenuItemClasses(active)} onClick={() => setTheme("dark")}>
                  {theme === "dark" ? (
                    <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Moon className="mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  Dark Theme
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
