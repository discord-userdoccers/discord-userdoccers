import Head from "next/head";
import { useRouter } from "next/router";
import { SITEMAP } from "./navigation/NavigationList";

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
  const currentSection = SITEMAP.find(
    (section) => section.pages.findIndex((page) => page.link === router.asPath) !== -1,
  );
  const currentPage = currentSection?.pages.find((page) => page.link === router.asPath);

  const url = `https://${process.env.BASE_DOMAIN}${router.asPath}`;
  const isBase = router.asPath === "/intro";
  const google_site_verification = process.env.GOOGLE_SITE_VERIFICATION;

  const title = section ? `${section} | Discord Userdoccers` : "Unofficial Discord API Documentation | Discord Userdoccers";
  const image = isBase ? `/banner.webp` : undefined;
  const siteName = "Discord Userdoccers";

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": `https://${process.env.BASE_DOMAIN}`,
      "name": siteName,
      "alternateName": ["Userdoccers"],
    },

    !isBase && {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        currentSection?.name
          ? {
              "@type": "ListItem",
              "position": 1,
              "name": currentSection.name,
              "item": `https://${process.env.BASE_DOMAIN}/${currentSection.section}`,
            }
          : null,
        {
          "@type": "ListItem",
          "position": currentSection ? 2 : 1,
          "name": currentPage?.name || section,
          "item": url,
        },
      ].filter(Boolean), // Remove null values
    },
  ].filter(Boolean);

  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="canonical" href={url} />
        <meta key="description" name="description" content={description} />
        <meta
          name="keywords"
          content="Discord, API, Documentation, Userdoccers, Bots, Guides, Reference, Developer, Unofficial"
        />
        <meta name="author" content="Discord Userdoccers" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" key="twitter-card" />
        <meta name="twitter:title" content={title} key="twitter-title" />
        <meta name="twitter:description" content={description} key="twitter-desc" />
        {image && <meta name="twitter:image" content={image} key="twitter-image" />}
        {/* <meta name="twitter:site" content={twitterHandle} /> */}
        {/* <meta name="twitter:creator" content={twitterHandle} /> */}

        {/* Open Graph */}
        <meta property="og:type" content="website" key="og-type" />
        <meta property="og:url" content={url} key="og-url" />
        <meta property="og:site_name" content={siteName} key="og-site-name" />
        <meta property="og:title" content={title} key="og-title" />
        <meta property="og:description" content={description} key="og-desc" />
        {image && <meta property="og:image" content={image} key="og-image" />}
        <meta property="og:locale" content="en" />

        {/* FIXME: theme color contrasts with page body in safari */}
        <meta name="theme-color" content="#5864F2" />

        {/* Google Site Verification */}
        {google_site_verification && <meta name="google-site-verification" content={google_site_verification} />}

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData),
          }}
        />
      </Head>

      {/* Website title and canonical homepage */}
      <div itemScope itemType="https://schema.org/WebSite">
        <link itemProp="url" href={`https://${process.env.BASE_DOMAIN}`} />
        <meta itemProp="name" content={siteName} />
        <meta itemProp="alternateName" content="Userdoccers" />
      </div>
    </>
  );
}
