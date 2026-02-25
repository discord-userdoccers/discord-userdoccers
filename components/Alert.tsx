import classNames from "@lib/classnames";
import { CircleErrorIcon } from "./mdx/icons/CircleErrorIcon";
import { WarningIcon } from "./mdx/icons/WarningIcon";
import { CircleInformationIcon } from "./mdx/icons/CircleInformationIcon";

type AlertType = "danger" | "warn" | "info";

function getIcon(type: AlertType) {
  const iconClasses = "float-left mr-2 h-6 w-6 mb-2 mt-2 shrink-0";

  switch (type) {
    case "danger":
      return <CircleErrorIcon className={`${iconClasses} fill-[#f03f42]`} />;
    case "warn":
      return <WarningIcon className={`${iconClasses} fill-[#eeb132]`} />;
    case "info":
      return <CircleInformationIcon className={`${iconClasses} fill-[#00a9fa]`} />;
  }
}

function getClasses(type: AlertType) {
  return classNames("block flex items-start my-4 px-2 border-2 rounded-lg overflow-auto [&_p]:mb-2 [&_p]:mt-2", {
    "bg-red-100 border-[#f03f42] dark:bg-[#41373d] amoled:bg-black amoled:border-[#f03f42]/50": type === "danger",
    "bg-yellow-100 border-[#eeb132] dark:bg-[#3f3b39] amoled:bg-black amoled:border-[#eeb132]/50": type === "warn",
    "bg-blue-100 border-[#00a9fa] dark:bg-[#323c4a] amoled:bg-black amoled:border-[#00a9fa]/50": type === "info",
  });
}

interface AlertProps {
  type: AlertType;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Alert({ type, children, style }: AlertProps) {
  const icon = getIcon(type);
  const classes = getClasses(type);

  return (
    <aside
      className={classNames(classes, {
        "amoled:bg-black!": true,
      })}
      style={style}
    >
      {icon}
      <div>{children}</div>
    </aside>
  );
}
