"use client";

import handleActivity from "./handlers/activity";
import handleApplication from "./handlers/application";
import handleUser from "./handlers/user";

import { postCommand } from "./utils";

const HANDLERS = [handleUser, handleApplication, handleActivity];

addEventListener("message", async (event) => {
  const file = event.data as File;

  const handler = HANDLERS.find((h) => h.match(file.webkitRelativePath));

  if (handler == null) {
    postCommand("$file_end", void 0);

    return;
  }

  postCommand("$file_size", file.size);

  await handler.handle(file);

  // advance to end regardless of the outcome
  postCommand("$file_advance", file.size);
  postCommand("$file_end", void 0);
});
