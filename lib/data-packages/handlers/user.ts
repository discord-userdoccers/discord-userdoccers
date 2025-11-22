import z from "zod";
import { Handler, postCommand, parseZod } from "../utils";

// duplicated definition(s) from ../output/v1.ts
// I just don't want to import those because I want the schema version to be
// transparent to anything that isn't the event loop
// - arhsm

const PaymentSource = z.object({
  id: z.string(),
  flags: z.string().array(),
});

const User = z.object({
  id: z.string(),
  flags: z.string().array(),
  payment_sources: PaymentSource.array(),
});

export default {
  match(path) {
    const segments = path.split("/");

    return segments.length == 3 && segments[1].toLowerCase() === "account" && segments[2] === "user.json";
  },

  async handle(file: File) {
    const contents = await file.text();

    const user = parseZod(User, contents.trim(), file.webkitRelativePath, 1, "fatal");
    if (user == null) return;

    postCommand("user", user);
  },
} satisfies Handler;
