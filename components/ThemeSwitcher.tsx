import { Menu, Transition } from "@headlessui/react";
import classNames from "@lib/classnames";
import { useTheme } from "next-themes";
import { Fragment, useCallback } from "react";
import { CheckmarkLargeBoldIcon as Check } from "./mdx/icons/CheckmarkLargeBoldIcon";
import { GearIcon as Gear } from "./mdx/icons/GearIcon";
import { LightbulbIcon as Lightbulb } from "./mdx/icons/LightbulbIcon";
import { ThemeDarkIcon as Moon } from "./mdx/icons/ThemeDarkIcon";
import { ThemeLightIcon as Sun } from "./mdx/icons/ThemeLightIcon";
import { ThemeMidnightIcon as Midnight } from "./mdx/icons/ThemeMidnightIcon";

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
          className="bg-sidebar-tertiary-light hover:bg-brand-blurple focus-visible:ring-brand-blurple/75 dark:bg-sidebar-secondary-dark dark:hover:bg-brand-blurple inline-flex w-full justify-center rounded-md p-2 text-sm font-medium text-black transition duration-100 hover:text-white focus:outline-hidden focus-visible:ring-2 dark:text-white"
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
        <Menu.Items className="bg-sidebar-tertiary-light ring-brand-blurple/5 dark:bg-theme-dark-collapsible absolute right-0 z-40 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg ring-1 focus:outline-hidden dark:divide-gray-900">
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
            <Menu.Item>
              {({ active }) => (
                <button className={getMenuItemClasses(active)} onClick={() => setTheme("amoled")}>
                  {theme === "amoled" ? (
                    <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Midnight className="mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  Midnight Theme
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
