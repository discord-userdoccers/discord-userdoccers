import React, { Fragment, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import classNames from "classnames";
import Caret from "./icons/Caret";
import CaretFill from "./icons/CaretFill";
import useToggle from "../hooks/useToggle";
import Discord from "./icons/Discord";

interface MenuSelectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

function NavigationSection({ title, className, children }: MenuSelectionProps) {
  const classes = classNames("mb-6", className);

  return (
    <section className={classes}>
      {title ? (
        <h3 className="mb-2 ml-2 text-black dark:text-white font-whitney-bold text-xs uppercase">
          {title}
        </h3>
      ) : null}
      {children}
    </section>
  );
}

interface NavigationLinkProps {
  href: string;
  subLinks?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

function NavigationLink({
  href,
  subLinks,
  className,
  children,
}: NavigationLinkProps) {
  const router = useRouter();
  const { value: isOpen, toggle } = useToggle(router.pathname === href);

  // TODO: We currently have a bunch of listeners being added here - can this be improved?
  useEffect(() => {
    const handler = (url: string) => {
      // debugger;
      if (url.endsWith(href) && !isOpen) {
        toggle();
      }
    };

    router.events.on("routeChangeComplete", handler);
    return () => router.events.off("routeChangeComplete", handler);
  });

  const classes = classNames(
    "flex items-center font-whitney rounded-md",
    className,
    {
      "bg-brand-blurple text-white": router.pathname === href,
      "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
        router.pathname !== href,
    }
  );

  const caretClasses = classNames("w-4 h-4", {
    "rotate-90": isOpen,
  });

  const linkClasses = classNames(
    "group flex items-center px-2 py-1 w-full font-medium",
    {
      "ml-6": subLinks == null,
    }
  );

  return (
    <Fragment>
      <span className={classes}>
        {subLinks != null && (
          <a onClick={toggle} className="pl-2">
            <CaretFill className={caretClasses} />
          </a>
        )}
        <Link href={href}>
          <a className={linkClasses}>{children}</a>
        </Link>
      </span>
      {isOpen && subLinks != null ? subLinks : null}
    </Fragment>
  );
}

interface NavigationSubLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavigationSubLink({ href, children }: NavigationSubLinkProps) {
  const router = useRouter();
  const classes = classNames(
    "group flex items-center ml-6 px-2 py-1 w-full text-sm font-medium rounded-md",
    {
      "text-dark dark:text-white": router.asPath === href,
      "text-theme-light-sidebar-text hover:text-theme-light-sidebar-hover-text hover:text-dark dark:hover:text-white":
        router.asPath !== href,
    }
  );

  return (
    <span className="flex items-center ml-4">
      <Link href={href}>
        <a className={classes}>
          {router.asPath === href ? <Caret className="mr-1 w-2 h-2" /> : null}
          {children}
        </a>
      </Link>
    </span>
  );
}

export default function Navigation() {
  return (
    <nav className="flex-1 self-stretch mt-5 px-6">
      <a href="https://discord.com/developers/applications">
        <Discord className="mb-4 ml-auto mr-auto w-9/12 text-black dark:text-white" />
      </a>
      <NavigationSection className="mb-6 pb-6 border-b-2 border-gray-200 dark:border-theme-light-sidebar-text">
        <NavigationLink
          href="https://discord.com/developers/applications"
          className="text-lg"
        >
          Applications
        </NavigationLink>
        <NavigationLink
          href="https://discord.com/developers/teams"
          className="text-lg"
        >
          Teams
        </NavigationLink>
        <NavigationLink
          href="https://discord.gg/discord-developers"
          className="text-lg"
        >
          Join our Developer Discord!
        </NavigationLink>
      </NavigationSection>

      <NavigationSection>
        <NavigationLink href="/changelog">Changelog</NavigationLink>
        <NavigationLink href="/intro">Intro</NavigationLink>
        <NavigationLink href="/legal">Legal</NavigationLink>
        <NavigationLink href="/policy">Policy</NavigationLink>
        <NavigationLink
          href="/reference"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/reference#api-versioning">
                API Versioning
              </NavigationSubLink>
              <NavigationSubLink href="/reference#error-messages">
                Error Messages
              </NavigationSubLink>
              <NavigationSubLink href="/reference#authentication">
                Authentication
              </NavigationSubLink>
              <NavigationSubLink href="/reference#encryption">
                Encryption
              </NavigationSubLink>
              <NavigationSubLink href="/reference#snowflakes">
                Snowflakes
              </NavigationSubLink>
              <NavigationSubLink href="/reference#id-serialization">
                ID Serialization
              </NavigationSubLink>
              <NavigationSubLink href="/reference#iso8601-date/time">
                ISO8601 Date/Time
              </NavigationSubLink>
              <NavigationSubLink href="/reference#nullable-and-optional-resource-fields">
                Nullable and Optional Resource Fields
              </NavigationSubLink>
              <NavigationSubLink href="/reference#consistency">
                Consistency
              </NavigationSubLink>
              <NavigationSubLink href="/reference#http-api">
                HTTP API
              </NavigationSubLink>
              <NavigationSubLink href="/reference#gateway-(websocket)-api">
                Gateway (WebSocket) API
              </NavigationSubLink>
              <NavigationSubLink href="/reference#message-formatting">
                Message Formatting
              </NavigationSubLink>
              <NavigationSubLink href="/reference#image-formatting">
                Image Formatting
              </NavigationSubLink>
              <NavigationSubLink href="/reference#image-data">
                Image Data
              </NavigationSubLink>
            </Fragment>
          }
        >
          Reference
        </NavigationLink>
        <NavigationLink href="/store-distribution-agreement">
          Store Distribution Agreement
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Interactions">
        <NavigationLink
          href="/interactions/application-commands"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/interactions/application-commands#application-command-object">
                Application Command Object
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#authorizing-your-application">
                Authorizing Your Application
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#registering-a-command">
                Registering a Command
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#updating-and-deleting-a-command">
                Updating and Deleting a Command
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#permissions">
                Permissions
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#slash-commands">
                Slash Commands
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#subcommands-and-subcommand-groups">
                Subcommands and Subcommand Groups
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#user-commands">
                User Commands
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#message-commands">
                Message Commands
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/application-commands#endpoints">
                Endpoints
              </NavigationSubLink>
            </Fragment>
          }
        >
          Application Commands
        </NavigationLink>
        <NavigationLink
          href="/interactions/message-components"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/interactions/message-components#what-is-a-component">
                What is a Component
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#component-object">
                Component Object
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#action-rows">
                Action Rows
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#responding-to-a-component-interaction">
                Responding to a Component Interaction
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#custom-id">
                Custom ID
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#buttons">
                Buttons
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#select-menus">
                Select Menus
              </NavigationSubLink>
            </Fragment>
          }
        >
          Message Components
        </NavigationLink>
        <NavigationLink
          href="/interactions/receiving-and-responding"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/interactions/receiving-and-responding#interaction-object">
                Interaction Object
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#message-interaction-object">
                Message Interaction Object
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#interactions-and-bot-users">
                Interactions and Bot Users
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#receiving-an-interaction">
                Receiving an Interaction
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#responding-to-an-interaction">
                Responding to an Interaction
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#followup-messages">
                Followup Messages
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#security-and-authorization">
                Security and Authorization
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/receiving-and-responding#endpoints">
                Endpoints
              </NavigationSubLink>
            </Fragment>
          }
        >
          Receiving &amp; Responding
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Resources">
        <NavigationLink href="/resources/application">
          Application
        </NavigationLink>
        <NavigationLink
          href="/resources/audit-log"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/audit-log#audit-log-object">
                Audit Log Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#audit-log-entry-object">
                Audit Log Entry Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#audit-log-change-object">
                Audit Log Change Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#get-guild-audit-log">
                Get Guild Audit Log
              </NavigationSubLink>
            </Fragment>
          }
        >
          Audit Log
        </NavigationLink>
        <NavigationLink
          href="/resources/channel"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/channel#channel-object">
                Channel Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#message-object">
                Message Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#message-reference-object">
                Message Reference Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#followed-channel-object">
                Followed Channel Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#reaction-object">
                Reaction Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#overwrite-object">
                Overwrite Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#thread-metadata-object">
                Thread Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#thread-member-object">
                Thread Member Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#embed-object">
                Embed Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#attachment-object">
                Attachment Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#channel-mention-object">
                Channel Mention Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#allowed-mentions-object">
                Allowed Mentions Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#embed-limits">
                Embed Limits
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#get-channel">
                Endpoints
              </NavigationSubLink>
            </Fragment>
          }
        >
          Channel
        </NavigationLink>
        <NavigationLink
          href="/resources/emoji"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/emoji#emoji-object">
                Emoji Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/emoji#list-guild-emojis">
                List Guild Emojis
              </NavigationSubLink>
              <NavigationSubLink href="/resources/emoji#get-guild-emoji">
                Get Guild Emoji
              </NavigationSubLink>
              <NavigationSubLink href="/resources/emoji#create-guild-emoji">
                Create Guild Emoji
              </NavigationSubLink>
              <NavigationSubLink href="/resources/emoji#modify-guild-emoji">
                Modify Guild Emoji
              </NavigationSubLink>
              <NavigationSubLink href="/resources/emoji#delete-guild-emoji">
                Delete Guild Emoji
              </NavigationSubLink>
            </Fragment>
          }
        >
          Emoji
        </NavigationLink>
        <NavigationLink
          href="/resources/guild"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/guild#guild-object">
                Guild Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#unavailable-guild-object">
                Unavailable Guild Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#guild-preview-object">
                Guild Preview Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#guild-widget-object">
                Guild Widget Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#guild-member-object">
                Guild Member Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#integration-object">
                Integration Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#ban-object">
                Ban Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#user-commands">
                User Commands
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#welcome-screen-object">
                Welcome Screen Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#membership-screening-object">
                Membership Screening Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#create-guild">
                Endpoints
              </NavigationSubLink>
            </Fragment>
          }
        >
          Guild
        </NavigationLink>
        <NavigationLink
          href="/resources/guild-template"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/guild-template#guild-template-object">
                Guild Template Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#get-guild-template">
                Get Guild Template
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#create-guild-from-guild-template">
                Create Guild From Guild Template
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#get-guild-templates">
                Get Guild Templates
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#create-guild-template">
                Create Guild Template
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#sync-guild-template">
                Sync Guild Template
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#modify-guild-template">
                Modify Guild Template
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#delete-guild-template">
                Delete Guild Template
              </NavigationSubLink>
            </Fragment>
          }
        >
          Guild Template
        </NavigationLink>
        <NavigationLink
          href="/resources/invite"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/invite#invite-object">
                Invite Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/invite#invite-metadata-object">
                Invite Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/invite#invite-stage-instance-object">
                Invite Stage Instance Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/invite#get-invite">
                Get Invite
              </NavigationSubLink>
              <NavigationSubLink href="/resources/invite#delete-invite">
                Delete Invite
              </NavigationSubLink>
            </Fragment>
          }
        >
          Invite
        </NavigationLink>
        <NavigationLink
          href="/resources/stage-instance"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/stage-instance#stage-instance-object">
                Stage Instance Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#definitions">
                Definitions
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#auto-closing">
                Auto Closing
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#create-stage-instance">
                Create Stage Instance
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#get-stage-instance">
                Get Stage Instance
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#modify-stage-instance">
                Modify Stage Instance
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#delete-stage-instance">
                Delete Stage Instance
              </NavigationSubLink>
            </Fragment>
          }
        >
          Stage Instance
        </NavigationLink>
        <NavigationLink
          href="/resources/sticker"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/sticker#sticker-object">
                Sticker Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#sticker-item-object">
                Sticker Item Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#sticker-pack-object">
                Sticker Pack Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#get-sticker">
                Get Sticker
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#list-nitro-sticker-packs">
                List Nitro Sticker Packs
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#list-guild-stickers">
                List Guild Stickers
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#get-guild-sticker">
                Get Guild Sticker
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#create-guild-sticker">
                Create Guild Sticker
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#modify-guild-sticker">
                Modify Guild Sticker
              </NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#delete-guild-sticker">
                Delete Guild Sticker
              </NavigationSubLink>
            </Fragment>
          }
        >
          Sticker
        </NavigationLink>
        <NavigationLink
          href="/resources/user"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/user#usernames-and-nicknames">
                Usernames and Nicknames
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#user-object">
                User Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#connection-object">
                Connection Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#get-current-user">
                Get Current User
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#get-user">
                Get User
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#modify-current-user">
                Modify Current User
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#get-current-user-guilds">
                Get Current User Guilds
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#leave-guild">
                Leave Guild
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#create-dm">
                Create DM
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#create-group-dm">
                Create Group DM
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#get-user-connections">
                Get User Connections
              </NavigationSubLink>
            </Fragment>
          }
        >
          User
        </NavigationLink>
        <NavigationLink
          href="/resources/voice"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/voice#voice-state-object">
                Voice State Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/voice#voice-region-object">
                Voice Region Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/voice#list-voice-regions">
                List Voice Regions
              </NavigationSubLink>
            </Fragment>
          }
        >
          Voice
        </NavigationLink>
        <NavigationLink
          href="/resources/webhook"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/webhook#webhook-object">
                Webhook Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/webhook#create-webhook">
                Webhook Management Endpoints
              </NavigationSubLink>
              <NavigationSubLink href="/resources/webhook#execute-webhook">
                Webhook Execution Endpoints
              </NavigationSubLink>
              <NavigationSubLink href="/resources/webhook#get-webhook-message">
                Webhook Message Endpoints
              </NavigationSubLink>
            </Fragment>
          }
        >
          Webhook
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Topics">
        <NavigationLink href="/topics/certified-devices">
          Certified Devices
        </NavigationLink>
        <NavigationLink href="/topics/community-resources">
          Community Resources
        </NavigationLink>
        <NavigationLink href="/topics/gateway">Gateway</NavigationLink>
        <NavigationLink href="/topics/oauth2">OAuth2</NavigationLink>
        <NavigationLink href="/topics/opcodes-and-status-codes">
          Opcodes &amp; Status Codes
        </NavigationLink>
        <NavigationLink href="/topics/permissions">Permissions</NavigationLink>
        <NavigationLink href="/topics/rpc">RPC</NavigationLink>
        <NavigationLink href="/topics/rate-limits">Rate Limits</NavigationLink>
        <NavigationLink href="/topics/teams">Teams</NavigationLink>
        <NavigationLink href="/topics/threads">Threads</NavigationLink>
        <NavigationLink href="/topics/voice-connections">
          Voice Connections
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Game & Server Management">
        <NavigationLink href="/game-and-server-management/how-to-get-your-game-on-discord">
          How to Get Your Game on Discord
        </NavigationLink>
        <NavigationLink href="/game-and-server-management/alpha-and-beta-testing">
          Alpha and Beta Testing
        </NavigationLink>
        <NavigationLink href="/game-and-server-management/special-channels">
          Special Channels
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Rich Presence">
        <NavigationLink href="/rich-presence/how-to">How To</NavigationLink>
        <NavigationLink href="/rich-presence/best-practices">
          Best Practices
        </NavigationLink>
        <NavigationLink href="/rich-presence/launch-checklist">
          Launch Checklist
        </NavigationLink>
        <NavigationLink href="/rich-presence/faq">FAQ</NavigationLink>
      </NavigationSection>

      <NavigationSection title="Game SDK">
        <NavigationLink href="/game-sdk/sdk-starter-guide">
          SDK Starter Guide
        </NavigationLink>
        <NavigationLink href="/game-sdk/discord">Discord</NavigationLink>
        <NavigationLink href="/game-sdk/achievments">
          Achievements
        </NavigationLink>
        <NavigationLink href="/game-sdk/activities">Activities</NavigationLink>
        <NavigationLink href="/game-sdk/applications">
          Applications
        </NavigationLink>
        <NavigationLink href="/game-sdk/discord-voice">
          Discord Voice
        </NavigationLink>
        <NavigationLink href="/game-sdk/images">Images</NavigationLink>
        <NavigationLink href="/game-sdk/lobbies">Lobbies</NavigationLink>
        <NavigationLink href="/game-sdk/networking">Networking</NavigationLink>
        <NavigationLink href="/game-sdk/overlay">Overlay</NavigationLink>
        <NavigationLink href="/game-sdk/relationships">
          Relationships
        </NavigationLink>
        <NavigationLink href="/game-sdk/storage">Storage</NavigationLink>
        <NavigationLink href="/game-sdk/store">Store</NavigationLink>
        <NavigationLink href="/game-sdk/users">Users</NavigationLink>
      </NavigationSection>

      <NavigationSection title="Dispatch">
        <NavigationLink href="/dispatch/dispatch-and-you">
          Dispatch &amp; You
        </NavigationLink>
        <NavigationLink href="/dispatch/branches-and-builds">
          Branches &amp; Builds
        </NavigationLink>
        <NavigationLink href="/dispatch/list-of-commands">
          List of Commands
        </NavigationLink>
        <NavigationLink href="/dispatch/error-codes">
          Error Codes
        </NavigationLink>
        <NavigationLink href="/dispatch/field-values">
          Field Values
        </NavigationLink>
      </NavigationSection>
    </nav>
  );
}
