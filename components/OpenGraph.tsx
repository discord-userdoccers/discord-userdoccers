import Head from "next/head";
import { useRouter } from "next/router";

export const DEFAULT_SECTION = "Unofficial API Documentation";

interface OpenGraphProps {
  description?: string;
  section?: string;
}

export default function OpenGraph({
  description = "👽 ALIEN ALIEN ALIEN 👽",
  section = DEFAULT_SECTION,
}: OpenGraphProps) {
  const router = useRouter();
  const url = `https://${process.env.VERCEL_URL ?? "localhost:3000"}${router.asPath}`;
  const isBase = router.asPath === "/" || router.asPath === "/intro";
  const google_site_verification = process.env.GOOGLE_SITE_VERIFICATION;

  return (
    <Head>
      <title>Discord Userdoccers - Unofficial API Documentation</title>
      <meta key="description" name="description" content={description} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" key="twitter-card" />

      {/* Open Graph */}
      <meta property="og:url" content={url} key="og-url" />
      <meta property="og:site_name" content="Discord Userdoccers" key="og-site-name" />
      <meta property="og:title" content={`Discord Userdoccers - ${section}`} key="og-title" />
      <meta property="og:description" content={description} key="og-desc" />

      {/* Hide image on other routes */}
      {isBase && <meta property="og:image" content="/banner.webp" key="og-image" />}

      {/* FIXME: theme color contrasts with page body in safari */}
      <meta name="theme-color" content="#5864F2" />

      {/* Google Site Verification */}
      {google_site_verification && <meta name="google-site-verification" content={google_site_verification} />}
    </Head>
  );
}
