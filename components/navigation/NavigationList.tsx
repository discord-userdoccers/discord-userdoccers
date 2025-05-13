import { NavigationSection, NavigationLink, NavigationSubLink, SearchItem } from "./NavigationItems";
import data from "./data.json" with { type: "json" };

export interface NavigationData {
  name: string | null;
  pages: Page[] | Record<string, Page>;
  section: string;
}

export interface Page {
  name: string;
  link: string;
  subLinks: SubLink[];
  sort: number;
}

export interface SubLink {
  link: string;
  name: string;
  level: number;
}

export default function NavigationList() {
  return (
    <>
      {(data as any as NavigationData[]).map((section) => {
        const pages = Array.isArray(section.pages) ? section.pages : Object.values(section.pages);
        pages.sort((a, b) => (a.sort === b.sort ? a.name.localeCompare(b.name) : a.sort + b.sort));
        const renderedPages = pages.map((page) => (
          <NavigationLink
            href={page.link}
            subLinks={
              page.subLinks.length === 0
                ? null
                : page.subLinks.map((subLink) => (
                    <NavigationSubLink href={subLink.link} key={subLink.link}>
                      {subLink.name}
                    </NavigationSubLink>
                  ))
            }
            key={page.link}
          >
            {page.name}
          </NavigationLink>
        ));

        return (
          <NavigationSection title={section.name ?? undefined} key={section.section}>
            {section.name === null ? SearchItem : null}
            {renderedPages}
          </NavigationSection>
        );
      })}
    </>
  );
}
