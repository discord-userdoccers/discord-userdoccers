import { Fragment, useState } from "react";
import Header from "../Header";
import Menu from "../Menu";
import Footer from "../Footer";
import classNames from "classnames";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fadeClasses = classNames(
    "absolute z-30 left-0 top-0 w-full h-full bg-black duration-300 md:opacity-0 md:pointer-events-none",
    {
      "opacity-50": sidebarOpen,
      "opacity-0 pointer-events-none": !sidebarOpen,
    }
  );
  return (
    <Fragment>
      <div className="dark:bg-background-dark flex h-screen bg-white overflow-hidden">
        <div className={fadeClasses} onClick={() => setSidebarOpen(false)} />
        <Menu open={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="relative flex flex-1 flex-col items-center focus:outline-none overflow-y-auto">
          <Header setSidebarOpen={setSidebarOpen} />
          <div className="pb-10 px-10 w-full max-w-6xl">
            <article className="m-auto">{children}</article>
          </div>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
