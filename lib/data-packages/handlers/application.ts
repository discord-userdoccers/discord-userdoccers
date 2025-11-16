import { postCommand, readLines } from "../utils";

export async function handle(file: File) {
  await readLines(file, (line) => {
    const application = JSON.parse(line) as {
      id: string;
      flags: string[];
    };

    postCommand("application", {
      id: application.id,
      flags: application.flags,
    });
  });
}
