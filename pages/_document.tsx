/* eslint-disable @next/next/no-css-tags, @next/next/no-sync-scripts */
import { Head, Html, Main, NextScript } from "next/document";

import "../lib/docsearch";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_REACT_DEVTOOLS_ADDRESS ? (
          <script src={process.env.NEXT_PUBLIC_REACT_DEVTOOLS_ADDRESS} />
        ) : null}

        <link
          rel="preconnect"
          href={`https://${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "JAJUDFJBI4"}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
