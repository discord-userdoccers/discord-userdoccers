import classnames from "@lib/classnames";
import { CopyStatus, useClipboard } from "../hooks/useClipboard";

interface CopyButtonProps {
  text: string;
  children: React.ReactNode;
}

export default function CopyButton({ text, children }: CopyButtonProps) {
  const { copy, status } = useClipboard(text, 250);
  let value = children;

  if (status === CopyStatus.SUCCESS) {
    value = "Copied!";
  } else if (status === CopyStatus.ERROR) {
    value = "Copy failed :(";
  }

  const classes = classnames("clipboard", {
    clipboard_notification: status !== CopyStatus.INACTIVE,
  });

  return (
    <button
      type="button"
      className={classes}
      onClick={() => {
        void copy();
      }}
    >
      {value}
    </button>
  );
}
