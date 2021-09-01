import React, { Fragment } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";
import CaretFill from "./icons/CaretFill";
import useToggle from "../hooks/useToggle";

interface MenuSelectionProps {
  title?: string;
  children: React.ReactNode;
}

function MenuSection({ title, children }: MenuSelectionProps) {
  return (
    <section className="mb-6">
      {title ? (
        <h3 className="mb-2 ml-4 text-black dark:text-white font-whitney-bold text-xs uppercase">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

interface MenuLinkProps {
  href: string;
  subLinks?: React.ReactNode;
  children: React.ReactNode;
}

function MenuLink({ href, subLinks, children }: MenuLinkProps) {
  const router = useRouter();
  const { value: isOpen, toggle } = useToggle(router.pathname === href);
  const classes = classNames(
    "flex items-center px-2 py-1 font-whitney rounded-md",
    {
      "bg-brand-blurple text-white": router.pathname === href,
      "text-theme-light-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:text-theme-dark-sidebar-text":
        router.pathname !== href,
    }
  );

  const caretClasses = classNames("w-4 h-4", {
    "rotate-90": isOpen,
  });

  return (
    <Fragment>
      <span className={classes}>
        {subLinks != null && (
          <a onClick={toggle} className="pl-2">
            <CaretFill className={caretClasses} />
          </a>
        )}
        <Link href={href}>
          <a className="group flex items-center px-2 w-full text-base font-medium">
            {children}
          </a>
        </Link>
      </span>
      {isOpen && subLinks != null ? subLinks : null}
    </Fragment>
  );
}

interface MenuSubLinkProps {
  href: string;
  children: React.ReactNode;
}

function MenuSubLink({ href, children }: MenuSubLinkProps) {
  const router = useRouter();
  const classes = classNames(
    "group flex items-center ml-3 px-2 text-sm font-medium rounded-md",
    {
      "text-theme-light-sidebar-hover-text": router.asPath === href,
      "text-theme-light-sidebar-text hover:text-theme-light-sidebar-hover-text":
        router.asPath !== href,
    }
  );

  return (
    <span className="flex items-center">
      {/* router.asPath === href ? <Caret className="w-4 h-4 text-white" /> : null */}
      <Link href={href}>
        <a className={classes}>{children}</a>
      </Link>
    </span>
  );
}

export default function Menu() {
  return (
    <div className="text-theme-light-text hidden dark:bg-sidebar-tertiary-dark bg-sidebar-tertiary-light md:flex md:flex-shrink-0">
      <div className="flex flex-col w-80">
        <div className="flex flex-col flex-grow pb-4 pt-5 overflow-y-auto">
          <div className="flex flex-1 flex-col mt-5">
            <nav className="flex-1 px-6 text-sm">
              <MenuSection>
                <MenuLink href="/changelog">Changelog</MenuLink>
                <MenuLink href="/intro">Intro</MenuLink>
                <MenuLink href="/legal">Legal</MenuLink>
                <MenuLink href="/policy">Policy</MenuLink>
                <MenuLink href="/reference">Reference</MenuLink>
                <MenuLink href="/store-distribution-agreement">
                  Store Distribution Agreement
                </MenuLink>
              </MenuSection>

              <MenuSection title="Interactions">
                <MenuLink
                  href="/interactions/application-commands"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/interactions/application-commands#slash-commands">
                        Slash Commands
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Application Commands
                </MenuLink>
                <MenuLink href="/interactions/message-components">
                  Message Components
                </MenuLink>
                <MenuLink href="/interactions/receiving-and-responding">
                  Receiving &amp; Responding
                </MenuLink>
              </MenuSection>

              <MenuSection title="Resources">
                <MenuLink href="/resources/application">Application</MenuLink>
                <MenuLink href="/resources/audit-log">Audit Log</MenuLink>
                <MenuLink href="/resources/channel">Channel</MenuLink>
                <MenuLink href="/resources/emoji">Emoji</MenuLink>
                <MenuLink href="/resources/guild">Guild</MenuLink>
                <MenuLink href="/resources/guild-template">
                  Guild Template
                </MenuLink>
                <MenuLink href="/resources/invite">Invite</MenuLink>
                <MenuLink href="/resources/stage-instance">
                  Stage Instance
                </MenuLink>
                <MenuLink href="/resources/sticker">Sticker</MenuLink>
                <MenuLink href="/resources/user">User</MenuLink>
                <MenuLink href="/resources/voice">Voice</MenuLink>
                <MenuLink href="/resources/webhook">Webhook</MenuLink>
              </MenuSection>

              <MenuSection title="Topics">
                <MenuLink href="/topics/certified-devices">
                  Certified Devices
                </MenuLink>
                <MenuLink href="/topics/community-resources">
                  Community Resources
                </MenuLink>
                <MenuLink href="/topics/gateway">Gateway</MenuLink>
                <MenuLink href="/topics/oauth2">OAuth2</MenuLink>
                <MenuLink href="/topics/opcodes-and-status-codes">
                  Opcodes &amp; Status Codes
                </MenuLink>
                <MenuLink href="/topics/permissions">Permissions</MenuLink>
                <MenuLink href="/topics/rpc">RPC</MenuLink>
                <MenuLink href="/topics/rate-limits">Rate Limits</MenuLink>
                <MenuLink href="/topics/teams">Teams</MenuLink>
                <MenuLink href="/topics/threads">Threads</MenuLink>
                <MenuLink href="/topics/voice-connections">
                  Voice Connections
                </MenuLink>
              </MenuSection>

              <MenuSection title="Game & Server Management">
                <MenuLink href="/game-and-server-management/how-to-get-your-game-on-discord">
                  How to Get Your Game on Discord
                </MenuLink>
                <MenuLink href="/game-and-server-management/alpha-and-beta-testing">
                  Alpha and Beta Testing
                </MenuLink>
                <MenuLink href="/game-and-server-management/special-channels">
                  Special Channels
                </MenuLink>
              </MenuSection>

              <MenuSection title="Rich Presence">
                <MenuLink href="/rich-presence/how-to">How To</MenuLink>
                <MenuLink href="/rich-presence/best-practices">
                  Best Practices
                </MenuLink>
                <MenuLink href="/rich-presence/launch-checklist">
                  Launch Checklist
                </MenuLink>
                <MenuLink href="/rich-presence/faq">FAQ</MenuLink>
              </MenuSection>

              <MenuSection title="Game SDK">
                <MenuLink href="/game-sdk/sdk-starter-guide">
                  SDK Starter Guide
                </MenuLink>
                <MenuLink href="/game-sdk/discord">Discord</MenuLink>
                <MenuLink href="/game-sdk/achievments">Achievements</MenuLink>
                <MenuLink href="/game-sdk/activities">Activities</MenuLink>
                <MenuLink href="/game-sdk/applications">Applications</MenuLink>
                <MenuLink href="/game-sdk/discord-voice">
                  Discord Voice
                </MenuLink>
                <MenuLink href="/game-sdk/images">Images</MenuLink>
                <MenuLink href="/game-sdk/lobbies">Lobbies</MenuLink>
                <MenuLink href="/game-sdk/networking">Networking</MenuLink>
                <MenuLink href="/game-sdk/overlay">Overlay</MenuLink>
                <MenuLink href="/game-sdk/relationships">
                  Relationships
                </MenuLink>
                <MenuLink href="/game-sdk/storage">Storage</MenuLink>
                <MenuLink href="/game-sdk/store">Store</MenuLink>
                <MenuLink href="/game-sdk/users">Users</MenuLink>
              </MenuSection>

              <MenuSection title="Dispatch">
                <MenuLink href="/dispatch/dispatch-and-you">
                  Dispatch &amp; You
                </MenuLink>
                <MenuLink href="/dispatch/branches-and-builds">
                  Branches &amp; Builds
                </MenuLink>
                <MenuLink href="/dispatch/list-of-commands">
                  List of Commands
                </MenuLink>
                <MenuLink href="/dispatch/error-codes">Error Codes</MenuLink>
                <MenuLink href="/dispatch/field-values">Field Values</MenuLink>
              </MenuSection>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
