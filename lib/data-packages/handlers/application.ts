import z from "zod";
import { Handler, parseZod, postCommand } from "../utils";

const Application = z.object({
  id: z.string(),
  flags: z.string().array(),
});

export default {
  match(path) {
    const segments = path.split("/");

    return (
      segments.length == 5 &&
      segments[1].toLowerCase() === "account" &&
      segments[2] === "applications" &&
      segments[4] === "application.json"
    );
  },
  async handle(file: File) {
    const contents = await file.text();

    const application = parseZod(Application, contents.trim(), file.webkitRelativePath, 1, "fatal");
    if (application == null) return;

    postCommand("application", application);
  },
} satisfies Handler;
