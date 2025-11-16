import { postCommand } from "../utils";

export async function handle(file: File) {
  const contents = await file.text();
  const application = JSON.parse(contents.trim()) as {
    id: string;
    flags: string[];
  };

  postCommand("application", {
    id: application.id,
    flags: application.flags,
  });
}
