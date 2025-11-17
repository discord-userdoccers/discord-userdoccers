import { Dispatch, SetStateAction, useState } from "react";
import UploadButton from "./UploadButton";
import { Output } from "@lib/data-packages";

type Setter<T> = Dispatch<SetStateAction<T>>;

export enum State {
  Upload,
  Processing,
  Processed,
}

export interface Setters {
  state: Setter<State>;
  output: Setter<Output | null>;
  target: Setter<number>;
  progress: Setter<number>;
}

// TODO(arhsm): display output
export default function PackageView() {
  const [state, setState] = useState<State>(State.Upload);
  const [output, setOutput] = useState<Output | null>(null);
  const [target, setTarget] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);

  const setters: Setters = {
    state: setState,
    output: setOutput,
    target: setTarget,
    progress: setProgress,
  };

  return (
    <>
      <div className="flex h-80 w-full items-center justify-center rounded-md border border-black/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-700">
        {state == State.Upload && <UploadButton setters={setters} />}
        {state == State.Processing && (
          // no need to add transition here because the increments are so
          // granular that it doesn't matter
          <div className="h-2 w-64 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-600">
            <div
              className="h-full rounded-md bg-brand-blurple"
              style={{ width: `${(progress / target) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
      {state == State.Processed && (
        <div className="mt-4 flex gap-4">
          <button
            className="rounded-md bg-brand-blurple px-4 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75"
            onClick={() => {
              const json = JSON.stringify(output?.data, (_, v) => {
                if (v instanceof Set) return Array.from(v);

                return v;
              });

              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);

              const link = document.createElement("a");

              link.href = url;
              link.download = "data-package.json";
              link.click();

              URL.revokeObjectURL(url);
            }}
          >
            Download
          </button>
        </div>
      )}
    </>
  );
}
