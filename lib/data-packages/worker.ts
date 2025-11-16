"use client";

import { handle as handleActivity } from "./handlers/activity";
import { handle as handleApplication } from "./handlers/application";
import { handle as handleUser } from "./handlers/user";
import { postCommand } from "./utils";

addEventListener("message", async (event) => {
  const file = event.data as File;

  const segments = file.webkitRelativePath.split("/");

  if (segments.length < 2) return;

  if (segments.length == 3 && segments[1].toLowerCase() === "account" && segments[2] === "user.json") {
    postCommand("__file_size", file.size);

    await handleUser(file);
  } else if (
    segments.length == 5 &&
    segments[1].toLowerCase() === "account" &&
    segments[2] === "applications" &&
    segments[4] === "application.json"
  ) {
    postCommand("__file_size", file.size);

    await handleApplication(file);
  } else if (segments[1]!.toLowerCase() === "activity") {
    postCommand("__file_size", file.size);

    await handleActivity(file);
  }

  postCommand("__file_end", void 0);
});
