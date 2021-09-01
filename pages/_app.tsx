import type { AppProps } from "next/app";
import MDX from "../components/MDX";
import "tailwindcss/tailwind.css";
import "../stylesheets/alert.css";
import "../stylesheets/whitney/whitney.css";
import "../stylesheets/code.css";
import "../stylesheets/snowflake-deconstruction.css"

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MDX>
      <Component {...pageProps} />
    </MDX>
  );
}
