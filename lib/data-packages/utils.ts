import type { Command } from "./output";

export async function readLines(file: File, callback: (line: string) => void) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (value) {
      postCommand("__file_advance", value.length);
    }

    buffer += decoder.decode(value, { stream: !done });

    const lines = buffer.split("\n");

    buffer = lines.pop() || "";

    for (const line of lines) {
      callback(line);
    }

    if (done) {
      if (buffer) {
        callback(buffer);
      }
      break;
    }
  }
}

export function postCommand<T extends Command["type"]>(type: T, data: Extract<Command, { type: T }>["data"]) {
  postMessage({ type, data });
}
