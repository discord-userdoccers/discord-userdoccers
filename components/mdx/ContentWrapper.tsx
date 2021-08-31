import { Fragment } from "react";
import Header from "../Header";
import Menu from "../Menu";
import Footer from "../Footer";

export default function ContentWrapper({ children }) {
  return (
    <Fragment>
      <Header />

      <div className="h-screen flex overflow-hidden bg-gray-100">
        <Menu />

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <article className="m-auto prose">{children}</article>
        </main>
      </div>
      <Footer />
    </Fragment>
  );
}
