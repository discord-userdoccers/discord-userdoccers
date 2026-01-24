import React from "react";

interface ChangelogEntryProps {
  date: string;
  version?: string;
  children: React.ReactNode;
}

export const ChangelogEntry: React.FC<ChangelogEntryProps> = ({ date, version, children }) => {
  return (
    <div className="relative ml-3 border-l-2 border-brand-blurple/30 pb-6 pl-8 last:pb-0">
      <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-brand-blurple ring-4 ring-white dark:ring-background-dark"></div>

      <div className="mb-3 flex flex-col">
        <div className="flex items-center gap-3">
          {version && <h3 className="m-0 text-xl font-bold text-text-light dark:text-text-dark">{version}</h3>}
          <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
        </div>
      </div>

      <div className="prose max-w-none dark:prose-invert [&_li]:!mb-1 [&_li]:!mt-0">{children}</div>
    </div>
  );
};

export const Changelog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="mt-4">{children}</div>;
};
