import { useCallback, useEffect, useState } from "react";

export const COPY_STATUS = {
  INACTIVE: "inactive",
  SUCCESS: "success",
  ERROR: "error",
};

export function useClipboard(text: string, duration: number = 2500) {
  const [status, setStatus] = useState(COPY_STATUS.INACTIVE);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(COPY_STATUS.SUCCESS);
    } catch (error) {
      setStatus(COPY_STATUS.ERROR);
    }
  }, [text]);

  useEffect(() => {
    if (status === COPY_STATUS.INACTIVE) {
      return;
    }

    const timeout = setTimeout(() => setStatus(COPY_STATUS.INACTIVE), duration);
    return () => {
      clearTimeout(timeout);
    };
  }, [status, duration]);

  return {
    copy,
    status,
  };
}
