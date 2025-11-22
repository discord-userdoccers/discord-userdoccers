import { ZodType, prettifyError } from "zod";
import type { Command, Error } from "./output";

export interface Handler {
  match(path: string): boolean;
  handle(file: File): Promise<void>;
}

export function postCommand<T extends Command["type"]>(type: T, data: Extract<Command, { type: T }>["data"]) {
  postMessage({ type, data });
}

export function parseZod<O, I>(schema: ZodType<O, I>, contents: string, file: string, line: number, type: Error["type"]) {
  let json;

  try {
    json = JSON.parse(contents);
  } catch (e) {
    postCommand("$error", { file, line, message: (e as Error).message, contents, type });

    return;
  }

  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    postCommand("$error", { file, line, message: prettifyError(parsed.error), contents, type });

    return;
  }

  return parsed.data;
}

export async function* readLines(file: File) {
  const reader = file.stream().getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  let index = 1;

  while (true) {
    const { value, done } = await reader.read();

    if (value) {
      postCommand("$file_advance", value.length);
    }

    buffer += decoder.decode(value, { stream: !done });

    const lines = buffer.split("\n");

    buffer = lines.pop() || "";

    for (const line of lines) {
      yield { index, line };

      index++;
    }

    if (done) {
      if (buffer) {
        index++;

        yield { index, line: buffer };
      }

      break;
    }
  }
}
