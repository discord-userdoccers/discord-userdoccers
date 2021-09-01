import { Fragment } from "react";
import Header from "../Header";
import Menu from "../Menu";
import Footer from "../Footer";

interface ContentWrapperProps {
  children: React.ReactNode;
}

export default function ContentWrapper({ children }: ContentWrapperProps) {
  return (
    <Fragment>
      <div className="dark:bg-background-dark flex h-screen bg-white overflow-hidden">
        <Menu />

        <main className="relative flex flex-1 flex-col p-12 focus:outline-none overflow-y-auto">
          <Header />
          <div className="pb-10">
            <article className="m-auto">{children}</article>
          </div>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
