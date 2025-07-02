import { RobotIcon } from "../mdx/icons/RobotIcon";
import data from "./data.json" with { type: "json" };
import { NavigationLink, NavigationSection, NavigationSubLink, SearchItem } from "./NavigationItems";

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
  icon: keyof typeof ICONS | null;
}

export const ICONS = {
  Robot: RobotIcon,
};

export interface SubLink {
  link: string;
  name: string;
  level: number;
}

export default function NavigationList() {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {(data as any as NavigationData[]).map((section) => (
        <NavigationSection title={section.name ?? undefined} key={section.section}>
          {section.name === null ? SearchItem : null}
          {Object.values(section.pages).map((page) => (
            <NavigationLink
              href={page.link}
              icon={page.icon}
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
