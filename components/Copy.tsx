import classnames from "classnames";
import { COPY_STATUS, useClipboard } from "../hooks/useClipboard";

export default function CopyButton({ text, children }) {
  const { copy, status } = useClipboard(text);
  let value = children;

  if (status === COPY_STATUS.SUCCESS) {
    value = "Copied!";
  } else if (status === COPY_STATUS.ERROR) {
    value = "Copy failed :(";
  }

  const classes = classnames("clipboard", {
    clipboard_notification: status !== COPY_STATUS.INACTIVE,
  });

  return (
    <button type="button" className={classes} onClick={() => copy()}>
      {value}
    </button>
  );
}
