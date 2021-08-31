import { Fragment } from "react";
import Header from "../Header";
import Menu from "../Menu";
import Footer from "../Footer";

export default function ContentWrapper({ children }) {
  return (
    <Fragment>
      <Header />

      <div className="flex h-screen bg-white overflow-hidden">
        <Menu />

        <main className="relative flex-1 pb-10 pt-10 focus:outline-none overflow-y-auto">
          <article className="prose m-auto">{children}</article>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
