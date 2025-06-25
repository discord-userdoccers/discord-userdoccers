import { NextApiRequest, NextApiResponse } from "next";

const GIST_URL = "https://gist.githubusercontent.com/Dziurwa14/de2498e5ee28d2089f095aa037957cbb/raw/codes.md";

const ERRORS_REGEX = /\|\s*(\d{1,7})\s*\|\s*(.+)\|/;

// modified from lightbulb/cogs/aliens.py#L231
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

      if (group !== currentGroup) {
        currentGroup = group;
        errorCodes[currentGroup] = {
          name: currentGroupName,
          index: currentGroup,
          codes: { [codeNum]: name.trim() },
        };
      } else {
        errorCodes[currentGroup].codes[codeNum] = name.trim();
      }
    }
  }

  return Object.values(errorCodes);
}

export default async function errorCodes(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.send("Method Not Allowed");
    return;
  }

  // fetch raw gist
  const data = await fetch(GIST_URL);

  if (!data.ok) {
    console.error("GIST ERROR -", data.statusText);
    res.statusCode = 502;
    res.send("Bad Gateway");
    return;
  }

  const gistContent = await data.text();

  const errorCodes = parseContent(gistContent);
  res.statusCode = 200;
  // 30 mins
  res.setHeader("Cache-Control", "public, max-age=1800");

  res.json(errorCodes);
}
