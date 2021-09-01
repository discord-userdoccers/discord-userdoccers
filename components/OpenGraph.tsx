import Head from "next/head";

// TODO: Figure out how to dynamicallyu set the URL property
export default function OpenGraph({
  title = "Discord Developers",
  description = "👾 BOTS BOTS BOTS 👾",
}) {
  return (
    <Head>
      <meta key="description" name="description" content={description} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" key="twitter-card" />
      <meta name="twitter:creator" content="@discord" key="twitter-handle" />

      {/* Open Graph */}
      <meta property="og:url" content="" key="og-url" />
      <meta property="og:image" content="/opengraph.png" key="og-image" />
      <meta
        property="og:site_name"
        content="Discord Developers"
        key="og-site-name"
      />
      <meta property="og:title" content={title} key="og-title" />
      <meta property="og:description" content={description} key="og-desc" />
    </Head>
  );
}
