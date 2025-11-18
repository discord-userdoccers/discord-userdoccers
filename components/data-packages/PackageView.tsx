import { useContext, useEffect, useState } from "react";
import { LOOP, PackageContext, State } from "@lib/data-packages/output";

export default function PackageView() {
  const [state, setState] = useState<State>({ t: "idle" });

  return (
    <PackageContext value={[state, setState]}>
      {state.t !== "processed" && <UploadView />}
      {state.t === "processed" && (
        <>
          <div className="mt-4 flex gap-4">
            <button
              className="rounded-md bg-brand-blurple px-4 py-2 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75"
              onClick={() => {
                const json = JSON.stringify(state.v.output);

                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);

                const link = document.createElement("a");

                link.href = url;
                link.download = `${state.v.name}.json`;
                link.click();

                URL.revokeObjectURL(url);
              }}
            >
              Download
            </button>
          </div>
          <pre>{JSON.stringify(state.v, undefined, 2)}</pre>
        </>
      )}
    </PackageContext>
  );
}

function UploadView() {
  const [state, _] = useContext(PackageContext);

  return (
    <div className="flex h-80 w-full items-center justify-center rounded-md border border-black/10 bg-zinc-50 dark:border-white/10 dark:bg-zinc-700">
      {state.t === "idle" && <UploadButton />}
      {state.t === "processing" && (
        // no need to add transition here because the increments are so
        // granular that it doesn't matter
        <div className="h-2 w-64 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-600">
          <div className="h-full rounded-md bg-brand-blurple" style={{ width: `${state.v}%` }}></div>
        </div>
      )}
    </div>
  );
}

function UploadButton() {
  const [_, setState] = useContext(PackageContext);

  return (
    <div>
      <button className="rounded-md bg-brand-blurple text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blurple focus-visible:ring-opacity-75">
        <label id="package-upload-button" htmlFor="package-upload" className="inline-block cursor-pointer px-4 py-2">
          Upload
        </label>
      </button>
      <input
        aria-describedby="package-upload-button"
        id="package-upload"
        type="file"
        // @ts-expect-error this property exists, idk why it isn't typed
        webkitdirectory=""
        className="hidden"
        onChange={(e) => {
          const input = e.target;

          if (input.files == null || input.files.length === 0) return;

          LOOP.start(input.files, setState);
        }}
      />
    </div>
  );
}
