import classNames from "classnames";

type AlertType = "danger" | "warn" | "info";

function getClasses(type: AlertType) {
  return classNames("block my-4 px-4 border-2 rounded-lg overflow-auto dark:bg-opacity-50 dark:border-opacity-50", {
    "bg-red-100 border-red-500 dark:bg-red-900": type === "danger",
    "bg-yellow-100 border-yellow-600 dark:bg-yellow-900": type === "warn",
    "bg-blue-100 border-blue-500 dark:bg-blue-900": type === "info",
  });
}

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
}

export default function Alert({ type, children }: AlertProps) {
  return <aside className={getClasses(type)}>{children}</aside>;
}
