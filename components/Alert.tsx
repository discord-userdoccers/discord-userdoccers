import classNames from "@lib/classnames";

type AlertType = "danger" | "warn" | "info";

function getClasses(type: AlertType) {
  return classNames("block my-4 px-4 border-2 rounded-lg overflow-auto", {
    "bg-red-100 border-[#f03f42] dark:bg-[#41373d]": type === "danger",
    "bg-yellow-100 border-[#eeb132] dark:bg-[#3f3b39]": type === "warn",
    "bg-blue-100 border-[#00a9fa] dark:bg-[#323c4a]": type === "info",
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
