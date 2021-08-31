import type { AppProps } from "next/app";
import MDX from "../components/MDX";
import "tailwindcss/tailwind.css";
import "../stylesheets/alert.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MDX>
      <Component {...pageProps} />
    </MDX>
  );
}
