import React from "react";
import NavigationList from "./NavigationList";
import type { INavigation } from "../../pages/_app";
import ThemeSwitcher from "../ThemeSwitcher";
import Userdoccers from "../icons/Userdoccers";

export default function Navigation({ data }: { data: INavigation; }) {
  console.log(data)

  return (
    <nav className="mt-5 flex-1 self-stretch px-6">
      <div className="-mt-4 mb-8 hidden items-center md:flex">
        <a href="/intro" className="hidden md:block">
          <Userdoccers className="w-9/12 text-black dark:text-white" />
        </a>
        <ThemeSwitcher />
      </div>

      <NavigationList data={data} />
    </nav>
  );
}
