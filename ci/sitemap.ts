import { opendir, readFile, writeFile } from "fs/promises";
import { basename, join, sep } from "path";
import matter from "gray-matter";

/**
 * This script generates a sitemap.xml file & navigation sidebar for the website. It's meant to be run just before the site is deployed.
 *
 * Overview:
 * 1. List all the .mdx files in the `pages` directory
 * 2. Generate a valid sitemap with the filenames
 * 3. Extract markdown headings and create a navigation outline for use by <Navigation /> coponent
 */

const SPECIAL_PAGES: Record<string, { content: string; data: any }> = {
  "datamining/errors": {
    content: "",
    data: {
      "name": "Error Codes",
      "sort": 1,
      "sort-name": "error-codes",
      "show-sublinks": false,
      // TODO: fetch it here and create sublinks
      "sublinks": [],
      "max-sublink-level": 3,
      "icon": "Robot",
    },
  },
};

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
  .map((file) => file.slice(root.length + 1, -4).replaceAll(sep, "/"))
  .sort((a, b) => a.split("/").length - b.split("/").length);

// SPECIAL ERROR CODES PAGE
files.push(...Object.keys(SPECIAL_PAGES));

// SITEMAP

const BASE_DOMAIN = process.env.CF_PAGES_URL ?? "docs.discord.food";
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

// NAVIGATION LINKS

interface Page {
  name: string;
  sortName: string;
  link: `/${string}`;
  subLinks: any[];
  sort: number;
  icon: string | null;
}

const navigationLinks: Record<string, { name: string | null; items?: Record<string, Page>; pages: Page[] }> = {};
const headerRegex = /(?<header>#+) (?<name>.*)/;

for (const file of files) {
  let [section, link] = file.split("/");

  if (!link) {
    link = section;
    section = "__ROOT__";
  }

  const parsed =
    file in SPECIAL_PAGES ? SPECIAL_PAGES[file] : await readFile(join(root, `${file}.mdx`), "utf-8").then(matter);

  navigationLinks[section] ??= {
    name: section ? section.replaceAll("-", " ").replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) : null,
    items: {},
    pages: [],
  };
  const sectionList = navigationLinks[section];

  const name =
    parsed.data.name ??
    parsed.content
      .trim()
      .split("\n")
      .find((line) => line.startsWith("#"))
      ?.replace("# ", "");

  sectionList.items![link] ??= {
    name,
    sortName: parsed.data["sort-name"] ?? name,
    link: file === "index" ? "/" : `/${file}`,
    subLinks: [],
    sort: parsed.data.sort ?? 99999,
    icon: parsed.data.icon ?? null,
  };
  const page = sectionList.items![link];

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

// Probably not the best way to do this but it's fine, just converts the object into an array
for (const section in navigationLinks) {
  const pages = Object.values(navigationLinks[section].items!);
  pages.sort((a, b) => (a.sort === b.sort ? a.sortName.localeCompare(b.sortName) : a.sort - b.sort));
  navigationLinks[section].pages = pages;
  delete navigationLinks[section].items;
}

const sectionSortTable: Record<string, number> = {
  "datamining": 1,
  "resources": 2,
  "topics": 3,
  "remote-authentication": 4,
  "interactions": 5,
};

const navigationLinksArray = Object.entries(navigationLinks)
  .map(([section, data]) => ({ ...data, name: data.name === "__ROOT__" ? null : data.name, section }))
  .sort((a, b) => sectionSortTable[a.section] - sectionSortTable[b.section]);

await writeFile(join(process.cwd(), "components", "navigation", "data.json"), JSON.stringify(navigationLinksArray));
