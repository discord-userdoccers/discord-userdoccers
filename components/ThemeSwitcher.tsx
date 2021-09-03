import { Fragment } from "react";
import { Transition, Menu } from "@headlessui/react";
import classNames from "classnames";
import ChevronIcon from "./icons/Chevron";
import useTheme from "../hooks/useTheme";
import Moon from "./icons/Moon";
import Sun from "./icons/Sun";
import Gear from "./icons/Gear";
import Lightbulb from "./icons/Lightbulb";
import Check from "./icons/Check";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useTheme();

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex justify-center p-2 w-full text-white text-sm font-medium bg-black bg-opacity-20 hover:bg-opacity-30 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <span className="sr-only">Change Theme</span>
          <Lightbulb
            className="text-violet-200 hover:text-violet-100 w-6 h-6"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 dark:bg-black bg-white rounded-md focus:outline-none shadow-lg divide-gray-100 dark:divide-gray-900 divide-y origin-top-right ring-1 ring-black dark:ring-white ring-opacity-5">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-violet-500 text-white" : "text-gray-900"
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                  onClick={() => setTheme("system")}
                >
                  {theme === "system" ? (
                    <Check className="mr-2 w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Gear className="mr-2 w-5 h-5" aria-hidden="true" />
                  )}
                  System Theme
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-violet-500 text-white" : "text-gray-900"
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                  onClick={() => setTheme("light")}
                >
                  {theme === "light" ? (
                    <Check className="mr-2 w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Sun className="mr-2 w-5 h-5" aria-hidden="true" />
                  )}
                  Light Theme
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-violet-500 text-white" : "text-gray-900"
                  } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                  onClick={() => setTheme("dark")}
                >
                  {theme === "dark" ? (
                    <Check className="mr-2 w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Moon className="mr-2 w-5 h-5" aria-hidden="true" />
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
