import { Fragment } from "react";
import classNames from "classnames";
import Heading from "./mdx/Heading";

type RESTMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

const MethodBadge: React.FC<{ method: RESTMethod }> = ({ method }) => {
  const name = method.toUpperCase();

  const classes = classNames("uppercase p-2 rounded-lg", {
    "bg-blue-100 text-blue-500": name === "GET",
    "bg-green-100 text-green-500": name === "POST",
    "bg-yellow-100 text-yellow-500": name === "PATCH" || name === "PUT",
    "bg-red-100 text-red-500": name === "DELETE",
  });

  return <span className={classes}>{method}</span>;
}

const RouteHeader: React.FC<{ method:RESTMethod, url: string }> = ({ method, url, children }) => {
  return (
    <Fragment>
      <Heading as="h2">{children}</Heading>
      <MethodBadge method={method} /> <span>{url}</span>
    </Fragment>
  );
}

export default RouteHeader;