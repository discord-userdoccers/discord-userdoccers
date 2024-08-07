/**
 * This script generates a sitemap.xml file for the website. It's meant to be run just before the site is deployed.
 * 
 * It reads all the .mdx files in the `pages` directory and generates a sitemap.xml file with the URLs.
 */

import { opendir, writeFile } from "fs/promises";
import { join } from "path";

async function walk(path, filter) {
  let files = [];

  const dir = await opendir(path);

  for await (const item of dir) {
    const file = join(dir.path, item.name);
    if (item.isFile()) {
      if (filter(file)) files.push(file);
    }

    if (item.isDirectory()) {
      files = files.concat(await walk(file, filter));
    }
  }

  return files;
}

const BASE_DOMAIN = "docs.discord.sex";
// add domain
const createLink = (url) => `https://${BASE_DOMAIN}/${url}`;

function generateSiteMap(pages) {
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

const root = join(process.cwd(), "pages");
const files = [
  ...(await walk(root, (file) => file.endsWith(".mdx") && file.replace(`${root  }/`, "").split("/").length !== 1)),
].map((file) => file.slice(root.length + 1, -4));

// We generate the XML sitemap with the posts data
const sitemap = generateSiteMap(files);
  
await writeFile(join(process.cwd(), 'public', 'sitemap.xml'), sitemap)