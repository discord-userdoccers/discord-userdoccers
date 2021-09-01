import { Fragment } from "react";
import classNames from "classnames";
import { H2 } from "./mdx/Heading";

type RESTMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface MethodBadgeProps {
  method: RESTMethod;
}
function MethodBadge({ method }: MethodBadgeProps) {
  const name = method.toUpperCase();

  const classes = classNames("p-2 rounded-lg uppercase", {
    "bg-blue-100 text-blue-500": name === "GET",
    "bg-green-100 text-green-500": name === "POST",
    "bg-yellow-100 text-yellow-500": name === "PATCH" || name === "PUT",
    "bg-red-100 text-red-500": name === "DELETE",
  });

  return <span className={classes}>{method}</span>;
}

interface RouteHeaderProps {
  method: RESTMethod;
  url: string;
  children: React.ReactNode;
}

export default function RouteHeader({
  method,
  url,
  children,
}: RouteHeaderProps) {
  return (
    <Fragment>
      <H2>{children}</H2>
      <MethodBadge method={method} /> <span>{url}</span>
    </Fragment>
  );
}
