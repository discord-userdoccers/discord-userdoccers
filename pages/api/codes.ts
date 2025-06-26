const GIST_URL = "https://gist.githubusercontent.com/Dziurwa14/de2498e5ee28d2089f095aa037957cbb/raw/codes.md";

const ERRORS_REGEX = /\|\s*(\d{1,7})\s*\|\s*(.+)\|/;

export const runtime = "edge";

function parseContent(content: string) {
  const errorCodes: Record<number, { name: string | null; index: number; codes: Record<number, string> }> = {};
  let currentGroup: number | null = null;
  let currentGroupName: string | null = null;

  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      currentGroupName = line.slice(3).trim();
    }

    const match = ERRORS_REGEX.exec(line.trim());
    if (match) {
      const [, code, name] = match;
      const group = parseInt(code.padStart(7, "0").slice(0, 3));
      const codeNum = parseInt(code);
      let value = name.trim();

      if (/^[A-Z0-9_ ()]+$/.test(value) && !value.endsWith(" (UNKNOWN)")) {
        value += " (UNKNOWN)";
      }

      if (group !== currentGroup) {
        currentGroup = group;
        errorCodes[currentGroup] = {
          name: currentGroupName,
          index: currentGroup,
          codes: { [codeNum]: value },
        };
      } else {
        errorCodes[currentGroup].codes[codeNum] = value;
      }
    }
  }

  return Object.values(errorCodes);
}

export default async function errorCodes(req: Request) {
  // fetch raw gist
  const data = await fetch(GIST_URL);

  if (!data.ok) {
    console.error("GIST ERROR -", data.statusText);
    return new Response("Bad Gateway", { status: 502 });
  }

  const gistContent = await data.text();

  const errorCodes = parseContent(gistContent);

  switch (req.method) {
    case "GET": {
      return Response.json(errorCodes, {
        headers: {
          "Cache-Control": "public, max-age=1800",
        },
      });
    }
    case "PUT": {
      if (!process.env.ERROR_CODES_WEBHOOK) return new Response("Submission Not Allowed", { status: 422 });

      const data = await req.formData();

      const code = data.get("code");
      const submissionType = data.get("submission_type");
      const reason = data.get("change_description");
      const message = data.get("message");

      if (!code || !submissionType || !reason) {
        return new Response("Missing Required Field", { status: 400 });
      }

      if (submissionType !== "delete" && !message) {
        return new Response("Missing Required Field: 'message'", { status: 400 });
      }

      if (typeof submissionType !== "string" || typeof code !== "string") {
        return new Response("Bad Request", { status: 400 });
      }

      // Given code like 10007, get the group (first digit(s) before the last 4 digits)
      const originalGroup = errorCodes.find((x) => x.index === parseInt(code.padStart(7, "0").slice(0, 3)));
      const originalCode = originalGroup?.codes[parseInt(code)];

      await fetch(process.env.ERROR_CODES_WEBHOOK, {
        method: "POST",
        body: JSON.stringify({
          embeds: [
            {
              color: submissionType === "new" ? 0x90ff43 : 0xffa500,
              title: `${submissionType[0].toUpperCase()}${submissionType.slice(1)} Error ${code}`,
              description: reason,
              fields: [
                originalCode
                  ? {
                      name: "Original Message",
                      value: originalCode,
                      inline: true,
                    }
                  : null,
                message
                  ? {
                      name: "New Message",
                      value: message,
                      inline: true,
                    }
                  : null,
              ].filter(Boolean),
              footer: {
                text: `Group: ${originalGroup?.name || "Unknown"}`,
              },
            },
          ],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      return new Response(null, { status: 201 });
    }
    default: {
      if (["GET", "PUT"].includes(req.method)) {
        return new Response("Internal Server Error", { status: 500 });
      } else {
        return new Response("Method Not Allowed", { status: 405 });
      }
    }
  }
}
