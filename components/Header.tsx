import Link from "next/link";
import { useCallback, useContext } from "react";
import MenuContext from "../contexts/MenuContext";
import Bars from "./icons/Bars";
import Userdoccers from "./icons/Userdoccers";
import ThemeSwitcher from "./ThemeSwitcher";

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
    <header className="dark:bg-theme-dark-sidebar sticky top-0 left-0 z-10 flex h-16 w-full items-center justify-between bg-white p-2 md:hidden md:p-4">
      <Link href="/" onClick={onMenuClick}>
        <Bars
          onClick={setOpen}
          className="ml-1 h-7 cursor-pointer justify-self-start text-black md:hidden dark:text-white"
        />
      </Link>

      <Userdoccers className="mr-auto ml-auto h-8 text-black dark:text-white" />

      <ThemeSwitcher />
    </header>
  );
}
