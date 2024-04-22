import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useState } from "react";
import Searchbar from "./Searchbar";
import ThemeSwitcher from "./ThemeSwitcher";
import Caret from "./icons/Caret";
import CaretFill from "./icons/CaretFill";
import Userdoccers from "./icons/Userdoccers";
import useToggle from "../hooks/useToggle";

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
        <h3 className="mb-2 ml-2 text-black dark:text-white font-whitney-bold text-xs uppercase">{title}</h3>
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

function NavigationLink({ href, subLinks, className, children }: NavigationLinkProps) {
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

  const classes = classNames("flex items-center font-whitney rounded-md", className, {
    "bg-brand-blurple text-white": router.pathname === href,
    "text-theme-light-sidebar-text dark:text-theme-dark-sidebar-text hover:bg-theme-light-sidebar-hover hover:text-theme-light-sidebar-hover-text dark:hover:bg-theme-dark-sidebar-hover dark:hover:text-white":
      router.pathname !== href,
  });

  const caretClasses = classNames("w-4 h-4", {
    "rotate-90": isOpen,
  });

  const linkClasses = classNames("group flex items-center px-2 py-1 w-full font-medium", {
    "ml-6": subLinks == null,
  });

  return (
    <Fragment>
      <span className={classes}>
        {subLinks != null && (
          <button onClick={toggle} className="pl-2">
            <CaretFill className={caretClasses} />
          </button>
        )}
        <Link href={href} className={linkClasses}>
          {children}
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

  const [currentPath, setPath] = useState("");

  const classes = classNames("group flex items-center ml-6 px-2 py-1 w-full text-sm font-medium rounded-md", {
    "text-dark dark:text-white": currentPath === href,
    "text-theme-light-sidebar-text hover:text-theme-light-sidebar-hover-text dark:hover:text-white":
      currentPath !== href,
  });

  useEffect(() => {
    setPath(router.asPath);
  }, [router.asPath]);

  return (
    <span className="relative flex items-center ml-4">
      <Link href={href} className={classes}>
        {currentPath === href ? <Caret className="absolute -ml-4 w-2 h-2" /> : null}
        {children}
      </Link>
    </span>
  );
}

export default function Navigation() {
  return (
    <nav className="flex-1 self-stretch mt-5 px-6">
      <div className="hidden items-center -mt-4 mb-8 md:flex">
        <a href="/intro" className="hidden md:block">
          <Userdoccers className="w-9/12 text-black dark:text-white" />
        </a>
        <ThemeSwitcher />
      </div>

      <NavigationSection>
        <div id="searchContainer" className="w-full flex-1 flex">
          <Searchbar />
        </div>

        <NavigationLink href="/intro">Intro</NavigationLink>
        <NavigationLink
          href="/reference"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/reference#api-versioning">API Versioning</NavigationSubLink>
              <NavigationSubLink href="/reference#error-messages">Error Messages</NavigationSubLink>
              <NavigationSubLink href="/reference#authentication">Authentication</NavigationSubLink>
              <NavigationSubLink href="/reference#encryption">Encryption</NavigationSubLink>
              <NavigationSubLink href="/reference#snowflake-format">Snowflake Format</NavigationSubLink>
              <NavigationSubLink href="/reference#id-serialization">ID Serialization</NavigationSubLink>
              <NavigationSubLink href="/reference#iso8601-date/time">ISO8601 Date/Time</NavigationSubLink>
              <NavigationSubLink href="/reference#consistency">Consistency</NavigationSubLink>
              <NavigationSubLink href="/reference#http-api">HTTP API</NavigationSubLink>
              <NavigationSubLink href="/reference#gateway-api">Gateway API</NavigationSubLink>
              <NavigationSubLink href="/reference#message-formatting">Message Formatting</NavigationSubLink>
              <NavigationSubLink href="/reference#cdn-formatting">CDN Formatting</NavigationSubLink>
              <NavigationSubLink href="/reference#cdn-data">CDN Data</NavigationSubLink>
              <NavigationSubLink href="/reference#uploading-files">Uploading Files</NavigationSubLink>
              <NavigationSubLink href="/reference#locales">Locales</NavigationSubLink>
              <NavigationSubLink href="/reference#documentation-reference">Documentation Reference</NavigationSubLink>
            </Fragment>
          }
        >
          Reference
        </NavigationLink>
        <NavigationLink
          href="/authentication"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/authentication#fingerprints">Fingerprints</NavigationSubLink>
              <NavigationSubLink href="/authentication#sessions">Sessions</NavigationSubLink>
              <NavigationSubLink href="/authentication#login">Login</NavigationSubLink>
              <NavigationSubLink href="/authentication#register">Register</NavigationSubLink>
              <NavigationSubLink href="/authentication#logout">Logout</NavigationSubLink>
              <NavigationSubLink href="/authentication#account-recovery">Account Recovery</NavigationSubLink>
              <NavigationSubLink href="/authentication#mfa-verification">MFA Verification</NavigationSubLink>
            </Fragment>
          }
        >
          Authentication
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Resources">
        <NavigationLink
          href="/resources/application"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/application#application-object">Application Object</NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-executable-object">
                Application Executable Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-sku-object">
                Application SKU Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-install-params-object">
                Application Install Params Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-proxy-config-object">
                Application Proxy Config Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#embedded-activity-config-object">
                Embedded Activity Config Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-asset-object">
                Application Asset Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-role-connection-object">
                Application Role Connection Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#application-role-connection-metadata-object">
                Application Role Connection Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/application#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Application
        </NavigationLink>
        <NavigationLink
          href="/resources/audit-log"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/audit-log#audit-log-object">Audit Log Object</NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#audit-log-entry-object">
                Audit Log Entry Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#audit-log-change-object">
                Audit Log Change Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#partial-integration-object">
                Partial Integration Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#partial-role-object">Partial Role Object</NavigationSubLink>
              <NavigationSubLink href="/resources/audit-log#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Audit Log
        </NavigationLink>
        <NavigationLink
          href="/resources/auto-moderation"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/auto-moderation#automod-system-messages">
                AutoMod System Messages
              </NavigationSubLink>
              <NavigationSubLink href="/resources/auto-moderation#automod-rule-object">
                AutoMod Rule Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/auto-moderation#automod-action-object">
                AutoMod Action Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/auto-moderation#automod-incidents-data-object">
                AutoMod Incidents Data Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/auto-moderation#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Auto Moderation
        </NavigationLink>
        <NavigationLink
          href="/resources/channel"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/channel#channel-object">Channel Object</NavigationSubLink>
              <NavigationSubLink href="/resources/channel#permission-overwrite-object">
                Permission Overwrite Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#thread-metadata-object">
                Thread Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#thread-member-object">Thread Member Object</NavigationSubLink>
              <NavigationSubLink href="/resources/channel#default-reaction-object">
                Default Reaction Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/channel#icon-emoji-object">Icon Emoji Object</NavigationSubLink>
              <NavigationSubLink href="/resources/channel#forum-tag-object">Forum Tag Object</NavigationSubLink>
              <NavigationSubLink href="/resources/channel#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Channel
        </NavigationLink>
        <NavigationLink
          href="/resources/message"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/message#message-object">Message Object</NavigationSubLink>
              <NavigationSubLink href="/resources/message#message-activity-object">
                Message Activity Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/message#message-call-object">Message Call Object</NavigationSubLink>
              <NavigationSubLink href="/resources/message#message-role-subscription-object">
                Message Role Subscription Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/message#message-reference-object">
                Message Reference Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/message#followed-channel-object">
                Followed Channel Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/message#reaction-object">Reaction Object</NavigationSubLink>
              <NavigationSubLink href="/resources/message#embed-object">Embed Object</NavigationSubLink>
              <NavigationSubLink href="/resources/message#attachment-object">Attachment Object</NavigationSubLink>
              <NavigationSubLink href="/resources/message#allowed-mentions-object">
                Allowed Mentions Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/message#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Message
        </NavigationLink>
        <NavigationLink
          href="/resources/discovery"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/discovery#searching-discovery">Searching Discovery</NavigationSubLink>
              <NavigationSubLink href="/resources/discovery#discoverable-guild-object">
                Discoverable Guild Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/discovery#discovery-requirements-object">
                Discovery Requirements Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/discovery#discovery-metadata-object">
                Discovery Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/discovery#discovery-category-object">
                Discovery Category Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/discovery#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Discovery
        </NavigationLink>
        <NavigationLink
          href="/resources/emoji"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/emoji#emoji-object">Emoji Object</NavigationSubLink>
              <NavigationSubLink href="/resources/emoji#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Emoji
        </NavigationLink>
        <NavigationLink
          href="/resources/guild"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/guild#guild-object">Guild Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#user-guild-object">User Guild Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#guild-preview-object">Guild Preview Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#guild-widget-object">Guild Widget Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#guild-member-object">Guild Member Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#ban-object">Ban Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#welcome-screen-object">Welcome Screen Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#membership-screening-object">
                Membership Screening Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild#onboarding-object">Onboarding Object</NavigationSubLink>
              <NavigationSubLink href="/resources/guild#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Guild
        </NavigationLink>
        <NavigationLink
          href="/resources/guild-scheduled-event"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/guild-scheduled-event#guild-scheduled-event-object">
                Guild Scheduled Event Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-scheduled-event#guild-scheduled-event-user-object">
                Guild Scheduled Event User Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-scheduled-event#subscribed-guild-scheduled-event-user-object">
                Subscribed Guild Scheduled Event User Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-scheduled-event#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Guild Scheduled Event
        </NavigationLink>
        <NavigationLink
          href="/resources/guild-template"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/guild-template#guild-template-object">
                Guild Template Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/guild-template#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Guild Template
        </NavigationLink>
        <NavigationLink
          href="/resources/integration"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/integration#integration-object">Integration Object</NavigationSubLink>
              <NavigationSubLink href="/resources/integration#integration-application-object">
                Integration Application Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/integration#integration-guild-object">
                Integration Guild Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/integration#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Integration
        </NavigationLink>
        <NavigationLink
          href="/resources/invite"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/invite#temporary-invites">Temporary Invites</NavigationSubLink>
              <NavigationSubLink href="/resources/invite#invite-object">Invite Object</NavigationSubLink>
              <NavigationSubLink href="/resources/invite#invite-metadata-object">
                Invite Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/invite#invite-guild-object">Invite Guild Object</NavigationSubLink>
              <NavigationSubLink href="/resources/invite#invite-stage-instance-object">
                Invite Stage Instance Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/invite#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Invite
        </NavigationLink>
        <NavigationLink
          href="/resources/premium-referral"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/premium-referral#premium-referral-object">
                Premium Referral Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/premium-referral#premium-referral-eligibility-object">
                Premium Referral Eligibility Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/premium-referral#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Premium Referral
        </NavigationLink>
        <NavigationLink
          href="/resources/presence"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/presence#presence-object">Presence Object</NavigationSubLink>
              <NavigationSubLink href="/resources/presence#client-status-object">
                Client Status Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/presence#activity-object">Activity Object</NavigationSubLink>
              <NavigationSubLink href="/resources/presence#activity-metadata-object">
                Activity Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/presence#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Presence
        </NavigationLink>
        <NavigationLink
          href="/resources/quests"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/quests#quest-object">Quest Object</NavigationSubLink>
              <NavigationSubLink href="/resources/quests#quest-config-object">Quest Config Object</NavigationSubLink>
              <NavigationSubLink href="/resources/quests#quest-messages-object">
                Quest Messages Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/quests#quest-user-status-object">
                Quest User Status Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/quests#quest-assets-object">Quest Assets Object</NavigationSubLink>
              <NavigationSubLink href="/resources/quests#quest-reward-object">Quest Reward Object</NavigationSubLink>
              <NavigationSubLink href="/resources/quests#quest-reward-config-object">
                Quest Reward Config Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/quests#discord-reward-object">
                Discord Reward Config Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/quests#discord-reward-messages-object">
                Discord Reward Messages Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/quests#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Quests
        </NavigationLink>
        <NavigationLink
          href="/resources/stage-instance"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/stage-instance#stage-instance-object">
                Stage Instance Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#definitions">Definitions</NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#auto-closing">Auto Closing</NavigationSubLink>
              <NavigationSubLink href="/resources/stage-instance#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Stage Instance
        </NavigationLink>
        <NavigationLink
          href="/resources/sticker"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/sticker#sticker-pack-object">Sticker Pack Object</NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#sticker-object">Sticker Object</NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#sticker-item-object">Sticker Item Object</NavigationSubLink>
              <NavigationSubLink href="/resources/sticker#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Sticker
        </NavigationLink>
        <NavigationLink
          href="/resources/team"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/team#team-object">Team Object</NavigationSubLink>
              <NavigationSubLink href="/resources/team#team-member-object">Team Member Object</NavigationSubLink>
              <NavigationSubLink href="/resources/team#team-payout-object">Team Payout Object</NavigationSubLink>
              <NavigationSubLink href="/resources/team#company-object">Company Object</NavigationSubLink>
              <NavigationSubLink href="/resources/team#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Teams
        </NavigationLink>
        <NavigationLink
          href="/resources/user"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/user#usernames-and-nicknames">
                Usernames and Nicknames
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#unique-usernames">Unique Usernames</NavigationSubLink>
              <NavigationSubLink href="/resources/user#user-object">User Object</NavigationSubLink>
              <NavigationSubLink href="/resources/user#profile-metadata-object">
                Profile Metadata Object
              </NavigationSubLink>
              <NavigationSubLink href="/resources/user#authenticator-object">Authenticator Object</NavigationSubLink>
              <NavigationSubLink href="/resources/user#backup-code-object">Backup Code Object</NavigationSubLink>
              <NavigationSubLink href="/resources/user#harvest-object">Harvest Object</NavigationSubLink>
              <NavigationSubLink href="/resources/user#connection-object">Connection Object</NavigationSubLink>
              <NavigationSubLink href="/resources/user#relationship-object">Relationship Object</NavigationSubLink>
              <NavigationSubLink href="/resources/user#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          User
        </NavigationLink>
        <NavigationLink
          href="/resources/voice"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/voice#voice-state-object">Voice State Object</NavigationSubLink>
              <NavigationSubLink href="/resources/voice#voice-region-object">Voice Region Object</NavigationSubLink>
              <NavigationSubLink href="/resources/voice#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Voice
        </NavigationLink>
        <NavigationLink
          href="/resources/webhook"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/resources/webhook#webhook-object">Webhook Object</NavigationSubLink>
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
        <NavigationLink
          href="/topics/captcha-handling"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/captcha-handling#identifying-captchas">
                Identifying CAPTCHAs
              </NavigationSubLink>
              <NavigationSubLink href="/topics/captcha-handling#solving-captchas">Solving CAPTCHAs</NavigationSubLink>
            </Fragment>
          }
        >
          CAPTCHA Handling
        </NavigationLink>
        <NavigationLink
          href="/topics/client-distribution"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/client-distribution#web">Web</NavigationSubLink>
              <NavigationSubLink href="/topics/client-distribution#desktop">Desktop</NavigationSubLink>
              <NavigationSubLink href="/topics/client-distribution#mobile">Mobile</NavigationSubLink>
              <NavigationSubLink href="/topics/client-distribution#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Client Distribution
        </NavigationLink>
        <NavigationLink
          href="/topics/experiments"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/experiments#fingerprints">Fingerprints</NavigationSubLink>
              <NavigationSubLink href="/topics/experiments#rollouts">Rollouts</NavigationSubLink>
              <NavigationSubLink href="/topics/experiments#user-experiments">User Experiments</NavigationSubLink>
              <NavigationSubLink href="/topics/experiments#guild-experiments">Guild Experiments</NavigationSubLink>
              <NavigationSubLink href="/topics/experiments#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Experiments
        </NavigationLink>
        <NavigationLink
          href="/topics/gateway"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/gateway#gateway-events">Gateway Events</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#connections">Connections</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#gateway-capabilities">Gateway Capabilities</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#gateway-intents">Gateway Intents</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#rate-limiting">Rate Limiting</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#encoding-and-compression">
                Encoding and Compression
              </NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#tracking-state">Tracking State</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#guild-availability">Guild Availability</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#sharding">Sharding</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#session-start-limit-object">
                Session Start Limit Object
              </NavigationSubLink>
              <NavigationSubLink href="/topics/gateway#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Gateway
        </NavigationLink>
        <NavigationLink
          href="/topics/gateway-events"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/gateway-events#send-events">Send Events</NavigationSubLink>
              <NavigationSubLink href="/topics/gateway-events#receive-events">Receive Events</NavigationSubLink>
            </Fragment>
          }
        >
          Gateway Events
        </NavigationLink>
        <NavigationLink
          href="/topics/oauth2"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/oauth2#shared-resources">Shared Resources</NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#state-and-security">State and Security</NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#authorization-code-grant">
                Authorization Code Grant
              </NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#implicit-grant">Implicit Grant</NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#client-credentials-grant">
                Client Gredentials Grant
              </NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#bots">Bots</NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#webhooks">Webhooks</NavigationSubLink>
              <NavigationSubLink href="/topics/oauth2#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          OAuth2
        </NavigationLink>
        <NavigationLink
          href="/topics/opcodes-and-status-codes"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/opcodes-and-status-codes#gateway">Gateway</NavigationSubLink>
              <NavigationSubLink href="/topics/opcodes-and-status-codes#voice">Voice</NavigationSubLink>
              <NavigationSubLink href="/topics/opcodes-and-status-codes#http">HTTP</NavigationSubLink>
              <NavigationSubLink href="/topics/opcodes-and-status-codes#json">JSON</NavigationSubLink>
            </Fragment>
          }
        >
          Opcodes &amp; Status Codes
        </NavigationLink>
        <NavigationLink
          href="/topics/permissions"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/permissions#permission-hierarchy">
                Permission Hierarchy
              </NavigationSubLink>
              <NavigationSubLink href="/topics/permissions#permission-overwrites">
                Permission Overwrites
              </NavigationSubLink>
              <NavigationSubLink href="/topics/permissions#implicit-permissions">
                Implicit Permissions
              </NavigationSubLink>
              <NavigationSubLink href="/topics/permissions#inherited-permissions-(threads)">
                Inherited Permissions (Threads)
              </NavigationSubLink>
              <NavigationSubLink href="/topics/permissions#permission-syncing">Permission Syncing</NavigationSubLink>
            </Fragment>
          }
        >
          Permissions
        </NavigationLink>
        <NavigationLink
          href="/topics/push-notifications"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/push-notifications#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Push Notifications
        </NavigationLink>
        <NavigationLink
          href="/topics/rate-limits"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/rate-limits#header-format">Header Format</NavigationSubLink>
              <NavigationSubLink href="/topics/rate-limits#exceeding-a-rate-limit">
                Exceeding A Rate Limit
              </NavigationSubLink>
              <NavigationSubLink href="/topics/rate-limits#global-rate-limit">Global Rate Limit</NavigationSubLink>
              <NavigationSubLink href="/topics/rate-limits#invalid-request-limit-aka-cloudflare-bans">
                Invalid Request Limit aka CloudFlare bans
              </NavigationSubLink>
              <NavigationSubLink href="/topics/rate-limits#unavailable-resources">
                Unavailable Resources
              </NavigationSubLink>
            </Fragment>
          }
        >
          Rate Limits
        </NavigationLink>
        <NavigationLink
          href="/topics/threads"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/threads#backwards-compatibility">
                Backwards Compatibility
              </NavigationSubLink>
              <NavigationSubLink href="/topics/threads#thread-fields">Thread Fields</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#public-&-private-threads">
                Public & Private Threads
              </NavigationSubLink>
              <NavigationSubLink href="/topics/threads#active-&-archived-threads">
                Active & Archived Threads
              </NavigationSubLink>
              <NavigationSubLink href="/topics/threads#permissions">Permissions</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#gateway-events">Gateway Events</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#thread-membership">Thread Membership</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#editing-&-deleting-threads">
                Editing & Deleting Threads
              </NavigationSubLink>
              <NavigationSubLink href="/topics/threads#nsfw-threads">NSFW Threads</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#new-message-types">New Message Types</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#enumerating-threads">Enumerating Threads</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#webhooks">Webhooks</NavigationSubLink>
              <NavigationSubLink href="/topics/threads#details-about-thread-access-and-syncing">
                Details About Thread Access and Syncing
              </NavigationSubLink>
            </Fragment>
          }
        >
          Threads
        </NavigationLink>
        <NavigationLink
          href="/topics/voice-connections"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/topics/voice-connections#voice-gateway">Voice Gateway</NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#connecting-to-voice">
                Connecting to Voice
              </NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#heartbeating">Heartbeating</NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#establishing-a-voice-websocket-connection">
                Establishing a Voice WebSocket Connection
              </NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#udp-connections">UDP Connections</NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#webrtc-connections">
                WebRTC Connections
              </NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#speaking">Speaking</NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#resuming-voice-connection">
                Resuming Voice Connection
              </NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#other-client-disconnection">
                Other Client Disconnection
              </NavigationSubLink>
              <NavigationSubLink href="/topics/voice-connections#voice-backend-version">
                Voice Backend Version
              </NavigationSubLink>
            </Fragment>
          }
        >
          Voice Connections
        </NavigationLink>
      </NavigationSection>

      <NavigationSection title="Remote Authentication">
        <NavigationLink
          href="/remote-authentication/intro"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/remote-authentication/intro#how-it-works">How it Works</NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/intro#how-to-use">How to Use</NavigationSubLink>
            </Fragment>
          }
        >
          Intro
        </NavigationLink>
        <NavigationLink
          href="/remote-authentication/desktop"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/remote-authentication/desktop#remote-authentication-gateway">
                Remote Authentication Gateway
              </NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/desktop#connecting">Connecting</NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/desktop#handshaking">Handshaking</NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/desktop#heartbeating">Heartbeating</NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/desktop#finalizing">Finalizing</NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/desktop#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Desktop
        </NavigationLink>
        <NavigationLink
          href="/remote-authentication/mobile"
          subLinks={
            <Fragment>
              <NavigationSubLink href="/remote-authentication/mobile#protocol">Protocol</NavigationSubLink>
              <NavigationSubLink href="/remote-authentication/mobile#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Mobile
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
              <NavigationSubLink href="/interactions/application-commands#permissions">Permissions</NavigationSubLink>
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
              <NavigationSubLink href="/interactions/application-commands#endpoints">Endpoints</NavigationSubLink>
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
              <NavigationSubLink href="/interactions/message-components#action-rows">Action Rows</NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#responding-to-a-component-interaction">
                Responding to a Component Interaction
              </NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#custom-id">Custom ID</NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#buttons">Buttons</NavigationSubLink>
              <NavigationSubLink href="/interactions/message-components#select-menus">Select Menus</NavigationSubLink>
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
              <NavigationSubLink href="/interactions/receiving-and-responding#endpoints">Endpoints</NavigationSubLink>
            </Fragment>
          }
        >
          Receiving &amp; Responding
        </NavigationLink>
      </NavigationSection>
    </nav>
  );
}
