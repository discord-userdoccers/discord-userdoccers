import classNames from "@lib/classnames";

type AlertType = "danger" | "warn" | "info";

function getClasses(type: AlertType) {
  return classNames("block my-4 px-4 dark:bg-opacity-50 border-2 dark:border-opacity-50 rounded-lg overflow-auto", {
    "bg-red-100 border-red-500 dark:bg-red-900": type === "danger",
    "bg-yellow-100 border-yellow-600 dark:bg-yellow-900": type === "warn",
    "bg-blue-100 border-blue-500 dark:bg-blue-900": type === "info",
  });
}

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Alert({ type, children, style }: AlertProps) {
  return (
    <aside className={getClasses(type)} style={style}>
      {children}
    </aside>
  );
}
