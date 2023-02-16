import Link from "next/link";
import { useCallback, useContext } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Bars from "./icons/Bars";
import Discord from "./icons/Discord";
import MenuContext from "../contexts/MenuContext";

export default function Header() {
  const { setOpen } = useContext(MenuContext);

  const onMenuClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      setOpen();
    },
    [setOpen]
  );

  return (
    <header className="sticky z-10 left-0 top-0 flex items-center justify-between p-2 w-full h-16 dark:bg-theme-dark-sidebar bg-theme-light-sidebar md:hidden md:p-4">
      <Link href="/menu" onClick={onMenuClick}>
        <Bars
          onClick={setOpen}
          className="justify-self-start ml-1 h-7 text-black dark:text-white cursor-pointer md:hidden"
        />
      </Link>

      <Discord className="ml-auto mr-auto h-8 text-black dark:text-white" />

      <ThemeSwitcher />
    </header>
  );
}
