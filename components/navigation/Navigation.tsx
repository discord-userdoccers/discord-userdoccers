import { useContext } from "react";
import MenuContext from "../../contexts/MenuContext";
import Bars from "../icons/Bars";
import Userdoccers from "../icons/Userdoccers";
import ThemeSwitcher from "../ThemeSwitcher";
import NavigationList from "./NavigationList";

export default function Navigation() {
  const { toggleSidebarHidden } = useContext(MenuContext);

  return (
    <nav className="mt-5 flex-1 self-stretch px-6">
      <div className="-mt-4 mb-8 hidden items-center md:flex">
        <a href="/" className="hidden md:block">
          <Userdoccers className="w-9/12 text-black dark:text-white" />
        </a>
        <ThemeSwitcher />
        <button
          className="bg-sidebar-tertiary-light hover:bg-brand-blurple focus-visible:ring-brand-blurple/75 dark:bg-sidebar-secondary-dark dark:hover:bg-brand-blurple ml-1 inline-flex items-center justify-center rounded-md p-2 text-black transition duration-100 hover:text-white focus:outline-hidden focus-visible:ring-2 dark:text-white"
          onClick={toggleSidebarHidden}
          title="Hide sidebar (Ctrl+B)"
          aria-label="Hide sidebar"
        >
          <Bars className="h-4 w-4 md:h-6 md:w-6" />
        </button>
      </div>

      <NavigationList />
    </nav>
  );
}
