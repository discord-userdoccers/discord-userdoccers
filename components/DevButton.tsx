import React from "react";
import AngleBrackets from "./icons/AngleBrackets";
import HyperlinkIcon from "./icons/Hyperlink";

const REPO = "https://github.com/discord-userdoccers/discord-userdoccers";

function getURLs() {
  const commit = import.meta.env.VITE_DEV_BUTTON_COMMIT;
  const branch = import.meta.env.VITE_DEV_BUTTON_BRANCH;
  const branchRepo = import.meta.env.VITE_DEV_BUTTON_BRANCH_REPO;
  const pr = import.meta.env.VITE_DEV_BUTTON_PR;

  const branchRoot = branchRepo ? `https://github.com/${branchRepo}` : REPO;

  return {
    commit: pr ? `${REPO}/pull/${pr}/changes/${commit}` : `${REPO}/commit/${commit}`,
    branch: branch ? `${branchRoot}/tree/${branch}` : null,
    pr: pr ? `${REPO}/pull/${pr}` : null,
  };
}

function Link({ href, children }: React.PropsWithChildren<{ href: string }>) {
  return (
    <a
      href={href}
      target="_blank"
      className="focus-visible:ring-brand-red/75 hover:bg-brand-red flex items-center gap-2 rounded-sm px-2 py-1 hover:text-white focus:outline-hidden focus-visible:ring-2"
    >
      <HyperlinkIcon className="h-4 w-4" />
      {children}
    </a>
  );
}

export default function DevButton() {
  const urls = getURLs();

  return (
    <>
      <button
        className="focus-visible:ring-brand-red/75 bg-brand-red fixed bottom-5 left-5 z-20 flex items-center gap-2 rounded-xl p-2 text-sm text-white shadow-lg focus:outline-hidden focus-visible:ring-2"
        popoverTarget="dev-button-menu"
      >
        <AngleBrackets className="h-4 w-4" />
      </button>
      <div
        id="dev-button-menu"
        popover="auto"
        className="bg-sidebar-tertiary-light dark:bg-theme-dark-collapsible dark:text-theme-dark-sidebar-text fixed inset-auto bottom-16 left-5 flex flex-col gap-2 rounded-lg p-2 text-sm text-gray-900 shadow-lg"
      >
        {urls.pr && <Link href={urls.pr}>PR</Link>}
        {urls.branch && <Link href={urls.branch}>Branch</Link>}
        <Link href={urls.commit}>Commit</Link>
      </div>
    </>
  );
}
