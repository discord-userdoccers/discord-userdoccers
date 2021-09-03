import { useContext } from "react";
import MenuContext from "../../contexts/MenuContext";
import Header from "../Header";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const { setOpen } = useContext(MenuContext);

  return (
    <main className="relative flex flex-1 flex-col items-center focus:outline-none overflow-y-auto">
      <Header setSidebarOpen={setOpen} />
      <div className="px-4 w-full max-w-6xl sm:px-6 lg:px-10">
        <article className="m-auto">{children}</article>{" "}
      </div>
    </main>
  );
}
