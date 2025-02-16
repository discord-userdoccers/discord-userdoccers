import { NavigationSection, NavigationLink, NavigationSubLink, SearchItem } from "./NavigationItems";
import data from "./data.json" with { type: "json" };

export default function NavigationList() {
  return (
    <>
      {data.map((section) => (
        <NavigationSection title={section.name ?? undefined} key={section.section}>
          {section.name === null ? SearchItem : null}
          {Object.values(section.pages).map((page) => (
            <NavigationLink
              href={page.link}
              subLinks={page.subLinks.map((subLink) => (
                <NavigationSubLink href={subLink.link} key={subLink.link}>
                  {subLink.name}
                </NavigationSubLink>
              ))}
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
