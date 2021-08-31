import classNames from "classnames";

type AlertType = "danger" | "warn" | "info";

function getClasses(type: AlertType) {
  return classNames("alert block p-4", {
    "bg-red-100 text-red-500": type === "danger",
    "bg-yellow-100 text-yellow-500": type === "warn",
    "bg-blue-100 text-blue-500": type === "info",
  });
}

const Alert: React.FC<{ type: AlertType }> = ({ type, children }) => {
  return <aside className={getClasses(type)}>{children}</aside>;
}

export default Alert;