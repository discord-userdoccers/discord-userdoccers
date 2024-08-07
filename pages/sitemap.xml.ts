import { opendir } from 'fs/promises';
import { join } from 'path';
import { GetServerSidePropsContext } from 'next';

async function walk(path: string, filter: (file: string) => boolean) {
  let files: string[] = []

  const dir = await opendir(path);

  for await (const item of dir) {
    const file = join(dir.path, item.name);
    if (item.isFile()) {
      if (filter(file)) files.push( file);
    }
    
    if (item.isDirectory()) {
      files = files.concat(await walk(file, filter));
    }
  }

  return files
}


const BASE_DOMAIN = process.env.NODE_ENV === 'production' ? 'docs.discord.sex' : process.env.VERCEL_URL ?? "localhost:3000";
// add domain
const createLink = (url: string) => `https://${BASE_DOMAIN}/${url}`;

function generateSiteMap(pages: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- give the root pages a higher priority -->
     <url><loc>${createLink("intro")}</loc></url>
     <url><loc>${createLink("reference")}</loc></url>
     <url><loc>${createLink("authentication")}</loc></url>
     <!-- now the rest of the pages -->
     ${pages.map((url) => `<url><loc>${createLink(url)}</loc></url>`).join("\n     ")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting

  return null
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  // We make an API call to gather the URLs for our site
  const root = join(process.cwd(), 'pages')
  const files = [...await walk(root, (file) => file.endsWith('.mdx') && file.replace(root + '/', '').split('/').length !== 1)].map(file => file.slice(root.length + 1, -4))

  console.log(files, __dirname)

  // We generate the XML sitemap with the posts data
  const sitemap = generateSiteMap(files);

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
