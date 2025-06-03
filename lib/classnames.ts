/**
 * This code has been adopted from https://github.com/JedWatson/classnames
 */

export type ClassName = null | undefined | false | string | number | Record<string, boolean> | ClassName[];

export default function classNames(...classNames: ClassName[]) {
  let classes = "";

  for (const name of classNames) {
    if (!name) continue;

    classes += " ";
    classes += parseValue(name);
  }

  return classes;
}

function parseValue(className: NonNullable<ClassName>) {
  if (typeof className === "string") {
    return className;
  }

  if (typeof className !== "object") {
    return "";
  }

  if (Array.isArray(className)) {
    return classNames.apply(null, className);
  }

  if (className.toString !== Object.prototype.toString && !className.toString.toString().includes("[native code]")) {
    return className.toString();
  }

  let classes = "";

  for (const [key, value] of Object.entries(className)) {
    if (!value) continue;

    classes += " ";
    classes += key;
  }

  return classes;
}
