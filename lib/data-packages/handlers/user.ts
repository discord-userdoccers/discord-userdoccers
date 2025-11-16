import { postCommand, readLines } from "../utils";

export async function handle(file: File) {
  await readLines(file, (line) => {
    const user = JSON.parse(line) as {
      id: string;
      flags: string[];
      payment_sources: { id: string; flags: string[] }[];
    };

    postCommand("user", {
      id: user.id,
      flags: user.flags,
      payment_sources: user.payment_sources.map((source) => ({ id: source.id, flags: source.flags })),
    });
  });
}
