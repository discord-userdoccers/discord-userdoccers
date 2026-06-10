import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import React, { Fragment } from "react";
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
    <MenuItem>
      {({ focus }) => (
        <a
          href={href}
          target="_blank"
          className={`focus-visible:ring-brand-red/75 flex items-center gap-2 rounded-sm px-2 py-1 focus:outline-hidden focus-visible:ring-2 ${
            focus ? "bg-brand-red text-white" : ""
          }`}
        >
          <HyperlinkIcon className="h-4 w-4" />
          {children}
        </a>
      )}
    </MenuItem>
  );
}

export default function DevButton() {
  const urls = getURLs();

  return (
    <Menu as="div" className="fixed bottom-5 left-5 z-20 inline-block text-left">
      <MenuButton className="focus-visible:ring-brand-red/75 bg-brand-red flex items-center gap-2 rounded-xl p-2 text-sm text-white shadow-lg focus:outline-hidden focus-visible:ring-2">
        <AngleBrackets className="h-4 w-4" />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems className="bg-sidebar-tertiary-light dark:bg-theme-dark-collapsible dark:text-theme-dark-sidebar-text absolute bottom-11 left-0 flex w-32 origin-bottom-left flex-col gap-2 rounded-lg p-2 text-sm text-gray-900 shadow-lg focus:outline-hidden">
          {urls.pr && <Link href={urls.pr}>PR</Link>}
          {urls.branch && <Link href={urls.branch}>Branch</Link>}
          <Link href={urls.commit}>Commit</Link>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
