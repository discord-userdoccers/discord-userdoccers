import React, { Dispatch, Fragment, SetStateAction } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";
import Caret from "./icons/Caret";
import CaretFill from "./icons/CaretFill";
import useToggle from "../hooks/useToggle";
import Bars from "./icons/Bars";
import Discord from "./icons/Discord";

interface MenuSelectionProps {
  title?: string;
  children: React.ReactNode;
}

function MenuSection({ title, className, children }: MenuSelectionProps) {
  const classes = classNames("mb-6", className);

  return (
    <section className={classes}>
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
  const classes = classNames("flex items-center font-whitney rounded-md", {
    "bg-brand-blurple text-white": router.pathname === href,
    "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
      router.pathname !== href,
  });

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
          <a className="group flex items-center px-2 py-1 w-full text-base font-medium">
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
    "group flex items-center ml-6 px-2 py-1 text-sm font-medium rounded-md",
    {
      "text-dark dark:text-white": router.asPath === href,
      "text-theme-light-sidebar-text hover:text-theme-light-sidebar-hover-text":
        router.asPath !== href,
    }
  );

  return (
    <span className="flex items-center">
      <Link href={href}>
        <a className={classes}>
          {router.asPath === href ? <Caret className="mr-1 w-2 h-2" /> : null}

          {children}
        </a>
      </Link>
    </span>
  );
}

interface MenuProps {
  open: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function Menu({ open, setSidebarOpen }: MenuProps) {
  const classes = classNames(
    [
      "text-theme-light-text absolute -left-full pr-16 md:pr-0 top-0 w-full h-full flex z-40 transition-transform duration-300 transform-gpu",
      "md:flex md:flex-shrink-0 md:left-auto md:relative md:w-auto md:transform-none md:transition-none",
    ],
    {
      "translate-x-full ": open,
      "translate-x-none md:flex": !open,
    }
  );
  return (
    <div className={classes}>
      <div className="flex flex-col w-full dark:bg-sidebar-tertiary-dark bg-sidebar-tertiary-light md:w-80">
        <div className="flex flex-col flex-grow pb-4 pt-5 overflow-y-auto">
          <div className="flex flex-1 flex-col items-start">
            <Bars
              onClick={() => setSidebarOpen(false)}
              className="ml-6 h-7 text-black dark:text-white cursor-pointer md:hidden"
            />
            <nav className="flex-1 self-stretch mt-5 px-6">
              <a href="https://discord.com/developers/applications">
                <Discord className="mb-4 ml-auto mr-auto w-9/12 text-black dark:text-white" />
              </a>
              <MenuSection className="mb-6 pb-6 border-b-2 border-white">
                <MenuLink href="https://discord.com/developers/applications">
                  Applications
                </MenuLink>
                <MenuLink href="https://discord.com/developers/teams">
                  Teams
                </MenuLink>
              </MenuSection>

              <MenuSection>
                <MenuLink href="/changelog">Changelog</MenuLink>
                <MenuLink href="/intro">Intro</MenuLink>
                <MenuLink href="/legal">Legal</MenuLink>
                <MenuLink href="/policy">Policy</MenuLink>
                <MenuLink 
                  href="/reference"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/reference#api-versioning">
                        API Versioning
                      </MenuSubLink>
                      <MenuSubLink href="/reference#error-messages">
                        Error Messages
                      </MenuSubLink>
                      <MenuSubLink href="/reference#authentication">
                        Authentication
                      </MenuSubLink>
                      <MenuSubLink href="/reference#encryption">
                        Encryption
                      </MenuSubLink>
                      <MenuSubLink href="/reference#snowflakes">
                        Snowflakes
                      </MenuSubLink>
                      <MenuSubLink href="/reference#id-serialization">
                        ID Serialization
                      </MenuSubLink>
                      <MenuSubLink href="/reference#iso8601-date/time">
                        ISO8601 Date/Time
                      </MenuSubLink>
                      <MenuSubLink href="/reference#nullable-and-optional-resource-fields">
                        Nullable and Optional Resource Fields
                      </MenuSubLink>
                      <MenuSubLink href="/reference#consistency">
                        Consistency
                      </MenuSubLink>
                      <MenuSubLink href="/reference#http-api">
                        HTTP API
                      </MenuSubLink>
                      <MenuSubLink href="/reference#gateway-(websocket)-api">
                        Gateway (WebSocket) API
                      </MenuSubLink>
                      <MenuSubLink href="/reference#message-formatting">
                        Message Formatting
                      </MenuSubLink>
                      <MenuSubLink href="/reference#image-formatting">
                        Image Formatting
                      </MenuSubLink>
                      <MenuSubLink href="/reference#image-data">
                        Image Data
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Reference
                </MenuLink>
                <MenuLink href="/store-distribution-agreement">
                  Store Distribution Agreement
                </MenuLink>
              </MenuSection>

              <MenuSection title="Interactions">
                <MenuLink
                  href="/interactions/application-commands"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/guild#application-command-object">
                        Application Command Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#authorizing-your-application">
                        Authorizing Your Application
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#registering-a-command">
                        Registering a Command
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#updating-and-deleting-a-command">
                        Updating and Deleting a Command
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#permissions">
                        Permissions
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#slash-commands">
                        Slash Commands
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#subcommands-and-subcommand-groups">
                        Subcommands and Subcommand Groups
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#user-commands">
                        User Commands
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#message-commands">
                        Message Commands
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#endpoints">
                        Endpoints
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Application Commands
                </MenuLink>
                <MenuLink
                  href="/interactions/message-components"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/interactions/message-components#what-is-a-component">
                        What is a Component
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/message-components#component-object">
                        Component Object
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/message-components#action-rows">
                        Action Rows
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/message-components#responding-to-a-component-interaction">
                        Responding to a Component Interaction
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/message-components#custom-id">
                        Custom ID
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/message-components#buttons">
                        Buttons
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/message-components#select-menus">
                        Select Menus
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Message Components
                </MenuLink>
                <MenuLink
                  href="/interactions/receiving-and-responding"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/interactions/receiving-and-responding#interaction-object">
                        Interaction Object
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#message-interaction-object">
                        Message Interaction Object
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#interactions-and-bot-users">
                        Interactions and Bot Users
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#receiving-an-interaction">
                        Receiving an Interaction
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#responding-to-an-interaction">
                        Responding to an Interaction
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#followup-messages">
                        Followup Messages
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#security-and-authorization">
                        Security and Authorization
                      </MenuSubLink>
                      <MenuSubLink href="/interactions/receiving-and-responding#endpoints">
                        Endpoints
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Receiving &amp; Responding
                </MenuLink>
              </MenuSection>

              <MenuSection title="Resources">
                <MenuLink href="/resources/application">Application</MenuLink>
                <MenuLink
                  href="/resources/audit-log"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/audit-log#audit-log-object">
                        Audit Log Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/audit-log#audit-log-entry-object">
                        Audit Log Entry Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/audit-log#audit-log-change-object">
                        Audit Log Change Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/audit-log#get-guild-audit-log">
                        Get Guild Audit Log
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Audit Log
                </MenuLink>
                <MenuLink
                  href="/resources/channel"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/channel#channel-object">
                        Channel Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#message-object">
                        Message Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#message-reference-object">
                        Message Reference Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#followed-channel-object">
                        Followed Channel Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#reaction-object">
                        Reaction Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#overwrite-object">
                        Overwrite Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#thread-metadata-object">
                        Thread Metadata Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#thread-member-object">
                        Thread Member Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#embed-object">
                        Embed Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#attachment-object">
                        Attachment Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#channel-mention-object">
                        Channel Mention Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#allowed-mentions-object">
                        Allowed Mentions Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#embed-limits">
                        Embed Limits
                      </MenuSubLink>
                      <MenuSubLink href="/resources/channel#get-channel">
                        Endpoints
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Channel
                </MenuLink>
                <MenuLink
                  href="/resources/emoji"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/emoji#emoji-object">
                        Emoji Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/emoji#list-guild-emojis">
                        List Guild Emojis
                      </MenuSubLink>
                      <MenuSubLink href="/resources/emoji#get-guild-emoji">
                        Get Guild Emoji
                      </MenuSubLink>
                      <MenuSubLink href="/resources/emoji#create-guild-emoji">
                        Create Guild Emoji
                      </MenuSubLink>
                      <MenuSubLink href="/resources/emoji#modify-guild-emoji">
                        Modify Guild Emoji
                      </MenuSubLink>
                      <MenuSubLink href="/resources/emoji#delete-guild-emoji">
                        Delete Guild Emoji
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Emoji
                </MenuLink>
                <MenuLink
                  href="/resources/guild"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/guild#guild-object">
                        Guild Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#unavailable-guild-object">
                        Unavailable Guild Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#guild-preview-object">
                        Guild Preview Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#guild-widget-object">
                        Guild Widget Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#guild-member-object">
                        Guild Member Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#integration-object">
                        Integration Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#ban-object">
                        Ban Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#user-commands">
                        User Commands
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#welcome-screen-object">
                        Welcome Screen Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#membership-screening-object">
                        Membership Screening Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild#create-guild">
                        Endpoints
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Guild
                </MenuLink>
                <MenuLink
                  href="/resources/guild-template"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/guild-template#guild-template-object">
                        Guild Template Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#get-guild-template">
                        Get Guild Template
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#create-guild-from-guild-template">
                        Create Guild From Guild Template
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#get-guild-templates">
                        Get Guild Templates
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#create-guild-template">
                        Create Guild Template
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#sync-guild-template">
                        Sync Guild Template
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#modify-guild-template">
                        Modify Guild Template
                      </MenuSubLink>
                      <MenuSubLink href="/resources/guild-template#delete-guild-template">
                        Delete Guild Template
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Guild Template
                </MenuLink>
                <MenuLink
                  href="/resources/invite"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/invite#invite-object">
                        Invite Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/invite#invite-metadata-object">
                        Invite Metadata Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/invite#invite-stage-instance-object">
                        Invite Stage Instance Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/invite#get-invite">
                        Get Invite
                      </MenuSubLink>
                      <MenuSubLink href="/resources/invite#delete-invite">
                        Delete Invite
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Invite
                </MenuLink>
                <MenuLink
                  href="/resources/stage-instance"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/stage-instance#stage-instance-object">
                        Stage Instance Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/stage-instance#definitions">
                        Definitions
                      </MenuSubLink>
                      <MenuSubLink href="/resources/stage-instance#auto-closing">
                        Auto Closing
                      </MenuSubLink>
                      <MenuSubLink href="/resources/stage-instance#create-stage-instance">
                        Create Stage Instance
                      </MenuSubLink>
                      <MenuSubLink href="/resources/stage-instance#get-stage-instance">
                        Get Stage Instance
                      </MenuSubLink>
                      <MenuSubLink href="/resources/stage-instance#modify-stage-instance">
                        Modify Stage Instance
                      </MenuSubLink>
                      <MenuSubLink href="/resources/stage-instance#delete-stage-instance">
                        Delete Stage Instance
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Stage Instance
                </MenuLink>
                <MenuLink
                  href="/resources/sticker"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/sticker#sticker-object">
                        Sticker Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#sticker-item-object">
                        Sticker Item Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#sticker-pack-object">
                        Sticker Pack Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#get-sticker">
                        Get Sticker
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#list-nitro-sticker-packs">
                        List Nitro Sticker Packs
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#list-guild-stickers">
                        List Guild Stickers
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#get-guild-sticker">
                        Get Guild Sticker
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#create-guild-sticker">
                        Create Guild Sticker
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#modify-guild-sticker">
                        Modify Guild Sticker
                      </MenuSubLink>
                      <MenuSubLink href="/resources/sticker#delete-guild-sticker">
                        Delete Guild Sticker
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Sticker
                </MenuLink>
                <MenuLink
                  href="/resources/user"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/user#usernames-and-nicknames">
                        Usernames and Nicknames
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#user-object">
                        User Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#connection-object">
                        Connection Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#get-current-user">
                        Get Current User
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#get-user">
                        Get User
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#modify-current-user">
                        Modify Current User
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#get-current-user-guilds">
                        Get Current User Guilds
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#leave-guild">
                        Leave Guild
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#create-dm">
                        Create DM
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#create-group-dm">
                        Create Group DM
                      </MenuSubLink>
                      <MenuSubLink href="/resources/user#get-user-connections">
                        Get User Connections
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  User
                </MenuLink>
                <MenuLink
                  href="/resources/voice"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/voice#voice-state-object">
                        Voice State Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/voice#voice-region-object">
                        Voice Region Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/voice#list-voice-regions">
                        List Voice Regions
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Voice
                </MenuLink>
                <MenuLink
                  href="/resources/webhook"
                  subLinks={
                    <Fragment>
                      <MenuSubLink href="/resources/webhook#webhook-object">
                        Webhook Object
                      </MenuSubLink>
                      <MenuSubLink href="/resources/webhook#create-webhook">
                        Webhook Management Endpoints
                      </MenuSubLink>
                      <MenuSubLink href="/resources/webhook#execute-webhook">
                        Webhook Execution Endpoints
                      </MenuSubLink>
                      <MenuSubLink href="/resources/webhook#get-webhook-message">
                        Webhook Message Endpoints
                      </MenuSubLink>
                    </Fragment>
                  }
                >
                  Webhook
                </MenuLink>
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
