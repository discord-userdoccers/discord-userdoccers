import Link from "next/link";
import { useCallback, useContext } from "react";
import ThemeSwitcher from "./ThemeSwitcher";
import Bars from "./icons/Bars";
import Userdoccers from "./icons/Userdoccers";
import MenuContext from "../contexts/MenuContext";

export default function Header() {
  const { setOpen } = useContext(MenuContext);

  const onMenuClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setOpen();
    },
    [setOpen],
  );

  return (
    <header className="sticky left-0 top-0 z-10 flex h-16 w-full items-center justify-between bg-theme-light-sidebar p-2 dark:bg-theme-dark-sidebar md:hidden md:p-4">
      <Link href="/" onClick={onMenuClick}>
        <Bars
          onClick={setOpen}
          className="ml-1 h-7 cursor-pointer justify-self-start text-black dark:text-white md:hidden"
        />
      </Link>

      <Userdoccers className="ml-auto mr-auto h-8 text-black dark:text-white" />

      <ThemeSwitcher />
    </header>
  );
}
