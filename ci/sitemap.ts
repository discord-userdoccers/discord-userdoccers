/**
 * This script generates a sitemap.xml file & navigation sidebar for the website. It's meant to be run just before the site is deployed.
 *
 * Overview:
 * 1. List all the .mdx files in the `pages` directory
 * 2. Generate a valid sitemap with the filenames
 * 3. Extract markdown headings and create a navigation outline for use by <Navigation /> coponent
 */

import { opendir, readFile, writeFile } from "fs/promises";
import { basename, join, sep } from "path";
import matter from "gray-matter";

async function walk(path: string, filter: (file: string) => boolean): Promise<string[]> {
  let files: string[] = [];

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

const root = join(process.cwd(), "pages");
const files = [...(await walk(root, (file) => file.endsWith(".mdx") && !basename(file).startsWith("_")))]
  .map((file) => file.slice(root.length + 1, -4).replaceAll(sep, '/'))
  .sort((a, b) => a.split('/').length - b.split('/').length);

// SITEMAP

const BASE_DOMAIN = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "docs.discord.sex";
// add domain
const createLink = (url: string) => `https://${BASE_DOMAIN}/${url}`;

function generateSiteMap(pages: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${pages.map((url) => `<url><loc>${createLink(url)}</loc></url>`).join("\n    ")}
   </urlset>
 `;
}
// We generate the XML sitemap with the posts data
const sitemap = generateSiteMap(files);

await writeFile(join(process.cwd(), "public", "sitemap.xml"), sitemap);

console.log("Done sitemap.xml");

// NAVIGATION LINKS

const navigationLinks: Record<
  string,
  { name: string | null; pages: Record<string, { name: string; link: `/${string}`; subLinks: any[]; sort: number }> }
> = {};
const headerRegex = /(?<header>#+) (?<name>.*)/;

for (const file of files) {
  let [section, link] = file.split("/");

  if (!link) {
    link = section;
    section = "__ROOT__";
  }

  const parsed = await readFile(join(root, `${file}.mdx`), "utf-8").then(matter);

  navigationLinks[section] ??= {
    name: section ? section.replaceAll("-", " ").replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : null,
    pages: {},
  };
  const sectionList = navigationLinks[section];

  sectionList.pages[link] ??= {
    name: parsed.data.name ?? parsed.content.trim().split("\n")[0].replace("# ", ""),
    link: `/${file}`,
    subLinks: [],
    sort: parsed.data.sort ?? Number.MAX_SAFE_INTEGER,
  };
  const page = sectionList.pages[link];

  const showSublinks = parsed.data["show-sublinks"] ?? true;

  if (!showSublinks) continue;

  const allowedSubLinks: string[] | undefined = parsed.data.sublinks;

  // We must go line-by-line to make sure we're not in a codeblock
  let inCodeBlock = false;
  for (const line of parsed.content.split("\n")) {
    if (line.startsWith("```")) inCodeBlock = !inCodeBlock;
    if (inCodeBlock) continue;

    const match = headerRegex.exec(line);

    if (!match?.groups) continue;

    const { name, header } = match.groups;

    if (header.length < 2 || header.length > (parsed.data["max-sublink-level"] ?? 3)) continue;

    const subLinkName = name.toLowerCase().replaceAll(" ", "-");

    if (allowedSubLinks && !allowedSubLinks.includes(subLinkName)) continue;

    page.subLinks.push({
      link: `/${file}#${subLinkName}`,
      name: name,
      level: header.length,
    });
  }

  // Sanity check
  if (allowedSubLinks && page.subLinks.length !== allowedSubLinks.length) {
    console.error(`Invalid data.sublinks in /${file}`);
  }
}

// SORTING NAVBAR

// FIXME: refactor this section

for (const section in navigationLinks) {
  navigationLinks[section].pages = Object.fromEntries(
    Object.entries(navigationLinks[section].pages).sort(([, a], [, b]) => a.sort - b.sort),
  );
}

const sectionSortTable: Record<string, number> = {
  "resources": 1,
  "topics": 2,
  "remote-authentication": 3,
  "interactions": 4,
};

const navigationLinksArray = Object.entries(navigationLinks)
  .map(([section, data]) => ({ ...data, section }))
  .sort((a, b) => sectionSortTable[a.section] - sectionSortTable[b.section]);

await writeFile(join(process.cwd(), "dist", "navigation.json"), JSON.stringify(navigationLinksArray));

console.log("Done navigation.json");
