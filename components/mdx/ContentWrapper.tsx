import { Fragment } from "react";
import Header from "../Header";
import Menu from "../Menu";
import Footer from "../Footer";

export default function ContentWrapper({ children }) {
  return (
    <Fragment>
      <div className="flex h-screen bg-white overflow-hidden">
        <Menu />

        <main className="relative flex flex-1 flex-col focus:outline-none overflow-y-auto">
          <Header />
          <div className="pb-10 pt-10">
            <article className="prose m-auto">{children}</article>
          </div>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
