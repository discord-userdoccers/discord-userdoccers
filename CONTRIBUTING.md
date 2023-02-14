# Contributing

This documentation strives to not only be accurate, but ***consistent***. It has many conventions to aid predictability and readability. These may be seen in the official documentation, but are not followed closely.

This document is meant as a guide to help you get started. If you are not sure on how to do something, _check other sections of the documentation_ to see how it is done.

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
- If a field is optional, it should be documented as `foo?`. If a field is nullable, the type should be documented as `?foo`.
- If a field is deprecated, it should be documented as `foo *(deprecated)*` (or ommited if unnecessary and not yet documented).
- In descriptions, capitals should be used, but periods should not be used.

###### Invite Channel Structure

| Field       | Type                                                      | Description                                                    |
| ----------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| id          | snowflake                                                 | The ID of this channel                                         |
| type        | integer                                                   | The [type of channel](/resources/channel#channel-types)        |
| name        | ?string                                                   | The name of the channel (1-100 characters)                     |
| recipients? | array[partial [user](/resources/user#user-object) object] | The recipients of the DM; only the `username` field is present |
| icon?       | ?string                                                   | The DM's [icon hash](/reference#cdn-formatting)                |

## Enums

Enums are used to define a set of constants. They are used in many places in the documentation, and should be defined at the end of their relevant object section like so:

If enums are used in multiple places, they should be defined by the most relevant section.

###### Visibility Type

| Value | Name     | Description                                      |
| ----- | -------- | ------------------------------------------------ |
| 0     | NONE     | Invisible to everyone except the user themselves |
| 1     | EVERYONE | Visible to everyone                              |

Note that **Type** is used, *not* **Types** like in the documentation.

For enums that have strings as values, the name can be skipped like so:

###### Platform Type

| Value   | Description                   |
| ------- | ----------------------------- |
| web     | Represents the web platform   |
| mobile  | Represents a mobile platform  |
| desktop | Represents a desktop platform |
