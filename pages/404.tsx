import classNames from "@lib/classnames";
import Link from "next/link";
import { ReactNode } from "react";
import ContentWrapper from "../components/mdx/ContentWrapper";
import Paragraph from "../components/mdx/Paragraph";

function LinkList({ className, children }: { className: string; children: ReactNode }) {
  const classes = classNames("grid gap-8 grid-cols-1 lg:grid-cols-2", className);
  return <ul className={classes}>{children}</ul>;
}

function LinkPanel({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <li className="rounded-lg bg-indigo-100 dark:bg-table-head-background-dark">
      <Link href={href} className="block p-4">
        <h4 className="text-center text-lg font-bold text-black dark:text-white">{title}</h4>
        <Paragraph>{children}</Paragraph>
      </Link>
    </li>
  );
}

// TODO: Add analytics about where users go from here, and how they got here in order to improve the docs
// TODO: Make this more contentful
export default function NotFound() {
  return (
    <ContentWrapper>
      <div className="min-h-screen px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <main className="lg:flex">
            <div className="lg:ml-6">
              <h1 className="text-center text-4xl font-extrabold tracking-tight text-black dark:text-white sm:text-5xl">
                404: Page not found
              </h1>

              <LinkList className="mt-10">
                <LinkPanel title="Reference" href="/reference">
                  Learn more about the Discord API and philosophy.
                </LinkPanel>
                <LinkPanel title="Status" href="https://discordstatus.com/">
                  Get Discord&apos;s current status, uptime, and response latency.
                </LinkPanel>
              </LinkList>
            </div>
          </main>
        </div>
      </div>
    </ContentWrapper>
  );
}
