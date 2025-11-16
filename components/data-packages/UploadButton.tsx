import { EventLoop } from "@lib/data-packages";
import { RefObject, useRef } from "react";
import { type Setters, State } from "./PackageView";

export default function UploadButton({ setters }: { setters: Setters }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <button className="rounded-md bg-brand-blurple text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75">
        <label id="package-upload-button" htmlFor="package-upload" className="inline-block cursor-pointer px-4 py-2">
          Upload
        </label>
      </button>
      <input
        ref={inputRef}
        aria-describedby="package-upload-button"
        id="package-upload"
        type="file"
        // @ts-expect-error this property exists, idk why it isn't typed
        webkitdirectory=""
        className="hidden"
        onChange={() => handlePackage(inputRef, setters)}
      />
    </div>
  );
}

let workers: Worker[];

async function handlePackage(ref: RefObject<HTMLInputElement | null>, setters: Setters) {
  if (workers == null) {
    workers = new Array(Math.min(4, navigator.hardwareConcurrency)).fill(undefined).map(
      (_, i) =>
        new Worker(new URL("../../lib/data-packages/worker", import.meta.url), {
          type: "module",
          name: `worker-${i}`,
        }),
    );

    window.addEventListener("beforeunload", () => {
      for (const worker of workers) {
        worker.terminate();
      }
    });
  }

  const input = ref.current!;

  if (input.files == null || input.files.length === 0) return;

  const loop = new EventLoop(
    input.files.length,
    workers,
    (output) => {
      setters.state(State.Processed);
      setters.output(output);
    },
    setters,
  );

  setters.state(State.Processing);

  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i]!;

    loop.addFile(file);
  }
}
