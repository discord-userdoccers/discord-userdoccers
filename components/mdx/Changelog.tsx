import React from "react";

interface ChangelogEntryProps {
  date: string;
  version?: string;
  children: React.ReactNode;
}

export const ChangelogEntry: React.FC<ChangelogEntryProps> = ({ date, version, children }) => {
  return (
    <div className="border-brand-blurple/30 relative ml-3 border-l-2 pb-6 pl-8 last:pb-0">
      <div className="bg-brand-blurple dark:ring-background-dark absolute top-1 -left-[9px] h-4 w-4 rounded-full ring-4 ring-white"></div>

      <div className="mb-3 flex flex-col">
        <div className="flex items-center gap-3">
          {version && <h3 className="text-text-light dark:text-text-dark m-0 text-xl font-bold">{version}</h3>}
          <span className="text-sm text-gray-500 dark:text-gray-400">{date}</span>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none [&_li]:mt-0! [&_li]:mb-1!">{children}</div>
    </div>
  );
};

export const Changelog: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="mt-4">{children}</div>;
};
