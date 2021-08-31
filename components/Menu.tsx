import { Fragment } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";
import Caret from "./icons/Caret";
import CaretFill from "./icons/CaretFill";
import useToggle from "../hooks/useToggle";

function MenuSection({ title, children }) {
  return (
    <section>
      {title ? <h3 className="uppercase">{title}</h3> : null}
      {children}
    </section>
  );
}

function MenuLink({ href, subLinks, children }) {
  const router = useRouter();
  const { value: isOpen, toggle } = useToggle(router.pathname === href);
  const classes = classNames("flex items-center px-2 rounded-md", {
    "bg-theme-light-sidebar-hover text-theme-light-sidebar-hover-text":
      router.pathname === href,
    "text-theme-light-sidebar-text hover:bg-indigo-600":
      router.pathname !== href,
  });

  return (
    <Fragment>
      <span className={classes}>
        {subLinks != null &&
          (isOpen ? (
            <a onClick={toggle}>
              <CaretFill className="text-sidebar-icon-primary-light w-4 h-4 rotate-90" />
            </a>
          ) : (
            <a onClick={toggle}>
              <Caret className="text-sidebar-icon-primary-light w-4 h-4" />
            </a>
          ))}
        <Link href={href}>
          <a className="group flex items-center px-2 py-2 w-full text-sm font-medium">
            {children}
          </a>
        </Link>
      </span>
      {isOpen && subLinks != null ? subLinks : null}
    </Fragment>
  );
}

function MenuSubLink({ href, children }) {
  const router = useRouter();
  const classes = classNames(
    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
    {
      "text-white": router.asPath === href,
      "text-indigo-100": router.asPath !== href,
    }
  );

  return (
    <span className="flex items-center">
      {router.asPath === href ? <Caret className="w-4 h-4 text-white" /> : null}
      <Link href={href}>
        <a className={classes}>{children}</a>
      </Link>
    </span>
  );
}

export default function Menu() {
  return (
    <div className="bg-sidebar-tertiary-light dark:bg-sidebar-tertiary-dark hidden text-theme-light-text md:flex md:flex-shrink-0">
      <div className="flex flex-col w-72">
        <div className="flex flex-col flex-grow pb-4 pt-5 overflow-y-auto">
          <div className="flex flex-1 flex-col mt-5">
            <nav className="flex-1 px-4 space-y-1">
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
