import { NavigationSection, NavigationLink, NavigationSubLink, SearchItem } from "./NavigationItems";
import data from "./data.json" with { type: "json" };

export interface NavigationData {
  name: string | null;
  pages: Page[];
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
      {(data as any as NavigationData[]).map((section) => (
        <NavigationSection title={section.name ?? undefined} key={section.section}>
          {section.name === null ? SearchItem : null}
          {Object.values(section.pages)
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((page) => (
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
            ))}
        </NavigationSection>
      ))}
    </>
  );
}
