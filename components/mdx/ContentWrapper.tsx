import { Fragment, useState } from "react";
import Header from "../Header";
import Menu from "../Menu";
import Footer from "../Footer";
import classNames from "classnames";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const fadeClasses = classNames("absolute top-0 left-0 h-full w-full bg-black z-30 duration-300 md:pointer-events-none md:opacity-0", {
    "opacity-50": sidebarOpen,
    "opacity-0 pointer-events-none": !sidebarOpen
  })
  return (
    <Fragment>
      <div className="flex h-screen bg-white overflow-hidden">
        <div className={fadeClasses} onClick={() => setSidebarOpen(false)}/>
        <Menu open={sidebarOpen} setSidebarOpen={setSidebarOpen}/>

        <main className="relative flex flex-1 flex-col items-center focus:outline-none overflow-y-auto">
          <Header setSidebarOpen={setSidebarOpen} />
          <div className="pb-10 pt-10 px-10 xl:w-2/3 w-full">
            <article className="m-auto">{children}</article>
          </div>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
