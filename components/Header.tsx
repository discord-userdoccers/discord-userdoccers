import { Fragment } from "react";
import { Transition, Menu } from "@headlessui/react";
import classNames from "classnames";
import ChevronIcon from "./icons/Chevron";
import useTheme from "../hooks/useTheme";
import Check from "./icons/Check";

export default function Header() {
  const [theme, setTheme] = useTheme();

  const getMenuItemClasses = (active: boolean) =>
    classNames("flex px-4 py-2 text-sm", {
      "bg-red-100 text-gray-900": active,
      "text-gray-700": !active,
    });

  return (
    <Menu
      as="div"
      className="relative inline-block ml-auto mr-4 mt-4 text-left"
    >
      <div>
        <Menu.Button className="inline-flex justify-center px-4 py-2 w-full text-gray-700 text-sm font-medium hover:bg-gray-50 bg-white border border-gray-300 rounded-md focus:outline-none shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
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
        <Menu.Items className="absolute right-0 mt-2 w-56 bg-white rounded-md focus:outline-none shadow-lg origin-top-right ring-1 ring-black ring-opacity-5">
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
