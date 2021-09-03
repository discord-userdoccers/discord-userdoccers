import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useContext,
} from "react";
import { Transition, Menu } from "@headlessui/react";
import Link from "next/link";
import classNames from "classnames";
import ChevronIcon from "./icons/Chevron";
import useTheme from "../hooks/useTheme";
import Check from "./icons/Check";
import Bars from "./icons/Bars";
import MenuContext from "../contexts/MenuContext";

export default function Header() {
  const [theme, setTheme] = useTheme();
  const { setOpen } = useContext(MenuContext);

  const onMenuClick = useCallback(
    (event) => {
      event.preventDefault();
      setOpen();
    },
    [setOpen]
  );

  const getMenuItemClasses = (active: boolean) =>
    classNames("flex px-4 py-2 text-sm", {
      "bg-theme-light-sidebar-hover text-theme-light-sidebar-hover-text dark:bg-theme-dark-sidebar-hover dark:text-white":
        active,
      "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text":
        !active,
    });

  return (
    <Menu
      as="div"
      className="relative flex items-center justify-between mt-4 px-4 w-full text-left md:justify-end"
    >
      <Link href="/menu">
        <a onClick={onMenuClick}>
          <Bars
            onClick={setOpen}
            className="justify-self-start ml-1 h-7 text-black dark:text-white cursor-pointer md:hidden"
          />
        </a>
      </Link>

      <div>
        <Menu.Button className="inline-flex px-4 py-2 w-full text-gray-700 text-sm font-medium hover:bg-gray-50 bg-white border border-gray-300 rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          Change Theme
          <ChevronIcon className="-mr-1 ml-2 w-5 h-5" aria-hidden="true" />
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
        <Menu.Items className="absolute right-0 self-start mt-2 w-56 dark:bg-sidebar-tertiary-dark bg-sidebar-tertiary-light rounded-md focus:outline-none shadow-lg origin-top-right ring-1 ring-black dark:ring-white ring-opacity-5">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  onClick={() => setTheme("system")}
                  className={getMenuItemClasses(active)}
                >
                  {theme === "system" ? <Check className="w-4 h-4" /> : null}
                  System
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  onClick={() => setTheme("dark")}
                  className={getMenuItemClasses(active)}
                >
                  {theme === "dark" ? <Check className="w-4 h-4" /> : null}
                  Dark
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  onClick={() => setTheme("light")}
                  className={getMenuItemClasses(active)}
                >
                  {theme === "light" ? <Check className="w-4 h-4" /> : null}
                  Light
                </a>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
