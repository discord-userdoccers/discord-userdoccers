import { Head, Html, Main, NextScript } from "next/document";

const ALGOLIA_HOST = `https://${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? "JAJUDFJBI4"}-dsn.algolia.net`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href={ALGOLIA_HOST} crossOrigin="anonymous" />
        {/* HACK: Fix docsearch in amoled theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="amoled"){document.documentElement.classList.add("amoled","dark")}}catch(e){}`,
          }}
        />
      </Head>
      <body className="dark:bg-background-dark bg-white">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
