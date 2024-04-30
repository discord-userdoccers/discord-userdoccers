# Contributing

This documentation strives to not only be accurate, but ***consistent***. It has many conventions to aid predictability and readability. These may be seen in the official documentation, but are not followed closely.

This document is meant as a guide to help you get started. If you are not sure on how to do something, _check other sections of the documentation_ to see how it is done.

## What Can I Contribute?

The documentation is a community effort, and any good faith contributions are welcome. Simple things like fixing typos, adding missing fields, updating enum values, or improving the formatting of a table are all valuable contributions. However, users without a good understanding of the Discord API are discouraged from attempting to document complex features, as reviewing and correcting these contributions can be more time-consuming for a maintainer than writing the documentation from scratch.

While we obviously have no guarantees that breaking changes aren't made to any given feature, brand-new, unreleased features should be given some time to mature before being documented. This is to avoid the documentation becoming outdated too quickly.

## Basics

### Markdown

The documentation is written in a superset of Markdown called MDX. This allows for the use of JSX in the documentation, which is used for endpoints, alert boxes, and more.

Endpoints are defined like so:

```jsx
<RouteHeader method="GET" path="/users/@me" supportsAuditReason unauthenticated supportsOAuth2="scope">
  Get Current User
</RouteHeader>
```

Alert boxes are defined like so:

```jsx
<Alert type="warn">
  This endpoint deletes Discord. Do not use it.
</Alert>
```

### Formatting

Within tables:

- Base types should be documented as `snowflake`, `string`, `integer`, or `boolean`. If the type is an object, it should be documented as `foo object` and `foo` should be linked to the object's documentation. If the type is an array, it should be documented as `array[foo object]` and `foo` should be linked to the object's documentation.
- If a field can have multiple types, it should be documented as `foo | bar | baz`. The `|` must be escaped with a backslash (`\|`) in the table.
- If a field is optional, it should be documented as `foo?`. If a field is nullable, the type should be documented as `?foo`.
- If a field is deprecated, it should be documented as `foo **(deprecated)**` (or ommited if unnecessary and not yet documented).
- In descriptions, capitals should be used, but periods should not be used. Abbreviations like "ID", "SKU", "URL", etc. should always be capitalized. Descriptions such as "The ID of the user" are preferred over "User ID" or "The user's ID".

###### Invite Channel Structure

| Field         | Type                                                      | Description                                                    |
| ------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| id            | snowflake                                                 | The ID of the channel                                          |
| type          | integer                                                   | The [type of channel](/resources/channel#channel-type)         |
| name ^1^      | ?string                                                   | The name of the channel (1-100 characters)                     |
| recipients?   | array[partial [user](/resources/user#user-object) object] | The recipients of the DM; only the `username` field is present |
| icon? ^1^ ^2^ | ?string                                                   | The DM's [icon hash](/reference#cdn-formatting)                |

^1^ Notes on fields are done using footnotes. The syntax for footnotes is `^n^` where `n` is the number of the footnote. The footnote itself is defined at the bottom of the table.

^2^ Please do not use asterisks (`*`) for footnotes!

## Enums

Enums are used to define a set of constants. They are used in many places in the documentation, and should be defined at the end of their relevant object section like so:

If enums are used in multiple places, they should be defined by the most relevant section.

###### Visibility Type

| Value | Name     | Description                                      |
| ----- | -------- | ------------------------------------------------ |
| 0     | NONE     | Invisible to everyone except the user themselves |
| 1     | EVERYONE | Visible to everyone                              |

###### Platform Type

| Value   | Description        |
| ------- | ------------------ |
| web     | The web platform   |
| mobile  | A mobile platform  |
| desktop | A desktop platform |

Note that **Type** is used, *not* **Types** like in the official documentation.

For enums that have strings as values, the name can be skipped like so:

## Flags

Defined very similarly to enums, flags are used to define a set of constants that can be combined. They are used in many places in the documentation, and should be defined at the end of their relevant object section like so:

If flags are used in multiple places, they should be defined by the most relevant section.

###### User Flags

| Value  | Name  | Description                   |
| ------ | ----- | ----------------------------- |
| 1 << 0 | ADMIN | This user is an administrator |

Note that the `IS_` prefix is removed from any flag names that may contain it, as it is redundant.

## Miscellaneous

This is a collection of guidelines that apply to the whole documentation.

- The documentation should be written in American English, as this reflects what the API uses. This means that words like "color" should be used instead of "colour", and "favorite" should be used instead of "favourite".
