import Head from "next/head";
import { useRouter } from "next/router";

interface OpenGraphProps {
  name?: string;
  title?: string;
  description?: string;
}

export default function OpenGraph({
  name = "Discord Userdoccers",
  title = "Unofficial User API Documentation",
  description = "👽 ALIEN ALIEN ALIEN 👽",
}: OpenGraphProps) {
  const router = useRouter();
  const url = `https://${process.env.VERCEL_URL ?? "localhost:3000"}${router.asPath}`;
  const google_site_verification = process.env.GOOGLE_SITE_VERIFICATION;

  return (
    <Head>
      <title>{name}</title>
      <meta key="description" name="description" content={description} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary" key="twitter-card" />
      <meta name="twitter:creator" content="@discord" key="twitter-handle" />

      {/* Open Graph */}
      <meta property="og:url" content={url} key="og-url" />
      <meta property="og:image" content="/opengraph.png" key="og-image" />
      <meta property="og:site_name" content={title} key="og-site-name" />
      <meta property="og:title" content={name} key="og-title" />
      <meta property="og:description" content={description} key="og-desc" />

      {/* Google Site Verification */}
      {google_site_verification && <meta name="google-site-verification" content={google_site_verification} />}
    </Head>
  );
}
