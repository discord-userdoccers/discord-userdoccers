import type { Command } from "./output";

// TODO(arhsm): make this less stupid
export async function readLines(file: File, callback: (line: string) => void) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (value != null) {
      postCommand("__file_advance", value.length);
    }

    buffer += decoder.decode(value, { stream: true });

    while (buffer.length) {
      const idx = buffer.indexOf("\n");

      if (idx !== -1) {
        const line = buffer.slice(0, idx);

        buffer = buffer.slice(idx + 1);

        callback(line);
      } else if (done) {
        callback(buffer);

        buffer = "";
      } else {
        break;
      }
    }

    if (done) {
      break;
    }
  }
}

export function postCommand<T extends Command["type"]>(type: T, data: Extract<Command, { type: T }>["data"]) {
  postMessage({ type, data });
}
