import classNames from "classnames";

type AlertType = "danger" | "warn" | "info";

function getClasses(type: AlertType) {
  return classNames("block my-4 px-4 rounded-lg overflow-auto", {
    "bg-red-100 dark:bg-red-500": type === "danger",
    "bg-yellow-100 dark:bg-yellow-600": type === "warn",
    "bg-blue-100 dark:bg-blue-500": type === "info",
  });
}

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
}

export default function Alert({ type, children }: AlertProps) {
  return <aside className={getClasses(type)}>{children}</aside>;
}
