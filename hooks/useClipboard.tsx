import { useCallback, useEffect, useState } from "react";

export const enum CopyStatus {
  INACTIVE = "inactive",
  SUCCESS = "success",
  ERROR = "error",
}

export function useClipboard(text: string, duration = 2500) {
  const [status, setStatus] = useState(CopyStatus.INACTIVE);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(CopyStatus.SUCCESS);
    } catch (error) {
      setStatus(CopyStatus.ERROR);
    }
  }, [text]);

  useEffect(() => {
    if (status === CopyStatus.INACTIVE) {
      return;
    }

    const timeout = setTimeout(() => setStatus(CopyStatus.INACTIVE), duration);
    return () => {
      clearTimeout(timeout);
    };
  }, [status, duration]);

  return {
    copy,
    status,
  };
}
