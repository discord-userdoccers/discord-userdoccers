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

function PRIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" {...props}>
      <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354ZM3.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm8.25.75a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Z" />
    </svg>
  );
}

function BranchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" {...props}>
      <path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Zm-6 0a.75.75 0 1 0 1.5 0 .75.75 0 0 0-1.5 0Zm8.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM4.25 12a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    </svg>
  );
}

function CommitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" {...props}>
      <path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
    </svg>
  );
}

function Link({ href, icon: Icon, children }: React.PropsWithChildren<{ href: string; icon: typeof PRIcon }>) {
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
          <Icon className="h-4 w-4" />
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
          {urls.pr && (
            <Link href={urls.pr} icon={PRIcon}>
              PR
            </Link>
          )}
          {urls.branch && (
            <Link href={urls.branch} icon={BranchIcon}>
              Branch
            </Link>
          )}
          <Link href={urls.commit} icon={CommitIcon}>
            Commit
          </Link>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
