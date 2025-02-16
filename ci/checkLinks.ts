import { readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import * as github from "@actions/core";
import chalk from "chalk";
const cwd = process.env.GITHUB_ACTIONS ? process.env.GITHUB_WORKSPACE! : process.cwd();

function importDirectory(directory: string, extension: string, subdirectories = true) {
  try {
    const output = new Map<string, string>();
    const files = readdirSync(directory);
    const requestedFiles = files.filter((name) => name.endsWith(extension));
    for (const file of requestedFiles) {
      const currentPath = path.join(directory, file);
      try {
        const read = readFileSync(currentPath, "utf8");
        output.set(`/${file}`, read);
      } catch {
        // Discard error, file is not a file, but a directory
      }
    }
    if (subdirectories) {
      for (const possibleDir of files) {
        const dirPath = `/${possibleDir}`;
        const currentPath = path.join(directory, dirPath);
        if (statSync(currentPath).isDirectory()) {
          const subdir = importDirectory(currentPath, extension, subdirectories);
          if (!subdir) continue;
          for (const [name, read] of subdir) {
            output.set(`${dirPath}${name}`, read);
          }
        }
      }
    }
    return output;
  } catch {
    // Directory likely does not exist, we should be able to safely discard this error
    return null;
  }
}

function scanFile(
  regex: RegExp,
  index: number,
  name: string,
  splitFile: string[],
  valid: Map<string, string[]>,
  results: github.AnnotationProperties[],
): void {
  let multilineCode = false;
  splitFile.forEach((line, lineNum) => {
    if (line.startsWith("```")) {
      multilineCode = !multilineCode;
      if (line.length > 3 && line.endsWith("```")) multilineCode = !multilineCode;
    }
    if (multilineCode) return;
    const matches = line.matchAll(regex);

    for (const match of matches) {
      // We remove <> from the match because it works but is erroneously detected as a base URL
      match[index] = match[index].replace(/[<>]/g, "");
      const split = match[index].split("#");
      let url = split[0].endsWith("/") ? split[0].slice(0, -1) : split[0];
      if (match[index].startsWith("#")) url = name;
      if (!valid.has(url)) {
        results.push({
          title: `Base url ${chalk.blueBright(url)} does not exist`,
          startLine: lineNum + 1,
          startColumn: match.index,
          endColumn: (match.index ?? 0) + match[0].length,
        });
        continue;
      }

      if (!split[1]) continue;
      const validAnchors = valid.get(url)!;
      if (!validAnchors.includes(split[1])) {
        results.push({
          title: `Anchor ${chalk.cyan(split[1])} does not exist on ${chalk.blueBright(url)}`,
          startLine: lineNum + 1,
          startColumn: match.index,
          endColumn: (match.index ?? 0) + match[0].length,
        });
      }
    }
  });
}

const builtFiles = importDirectory(path.join(cwd, ".next/server/pages"), ".js");

if (!builtFiles?.size) {
  console.error("No links found, ensure that build has been run!");
  process.exit(1);
}

const validLinks = new Map<string, string[]>();

let extLength = ".js".length;
const regex = /"h\d",null,"(.*?)"|mdxType:"RouteHeader"},"(.*?)"/g;

for (const [name, raw] of builtFiles) {
  const keyName = name.slice(0, -extLength);
  if (!validLinks.has(keyName)) {
    validLinks.set(keyName, []);
  }
  const validAnchors = validLinks.get(keyName)!;
  const matches = raw.matchAll(regex);

  for (const match of matches) {
    const name = match.slice(1).find((x) => x);
    if (!name) {
      throw new Error("Failed to find name for: " + match[0]);
    }
    // normalise the name
    const normal = name.toLowerCase().replace(/[^a-z0-9()\/]+/g, "-");
    validAnchors.push(normal);
  }
  validLinks.set(keyName, validAnchors);
}

console.log(validLinks);

const results = new Map<string, github.AnnotationProperties[]>();

const mdxFiles = importDirectory(path.join(cwd, "pages"), ".mdx");

if (!mdxFiles?.size) {
  console.error("No mdx files found!");
  process.exit(1);
}

extLength = ".mdx".length;

for (const [name, raw] of mdxFiles) {
  const fileName = `pages${name}`;
  const file = raw.split("\n");
  if (!results.has(fileName)) {
    results.set(fileName, []);
  }
  const ownResults = results.get(fileName)!;
  scanFile(
    /(?<![!`])\[[^\[\]]+?\]\((?!(?:https?)|(?:mailto))([^\(\)]*?(?:\([^\(\)]*?\)[^\(\)]*?)*?)\)(?!`)/g,
    1,
    name.slice(0, -extLength),
    file,
    validLinks,
    ownResults,
  );
}

function printResults(resultMap: Map<string, github.AnnotationProperties[]>): void {
  let output = "\n";
  let total = 0;
  for (const [resultFile, resultArr] of resultMap) {
    if (resultArr.length <= 0) continue;
    const filePath = path.join(cwd, resultFile);
    output += `${chalk.underline(filePath)}\n`;
    output += resultArr.reduce<string>((result, props) => {
      total += 1;
      return `${result}  ${props.startLine ?? ""}:${props.startColumn ?? ""}-${props.endColumn ?? ""}  ${chalk.yellow(
        "warning",
      )}  ${props.title ?? ""}\n`;
    }, "");
    output += "\n";
  }
  output += "\n";
  if (total > 0) {
    output += chalk.red.bold(`\u2716 ${total} problem${total === 1 ? "" : "s"}\n`);
  }
  console.log(output);
}

function annotateResults(resultMap: Map<string, github.AnnotationProperties[]>): void {
  let total = 0;
  for (const [resultFile, resultArr] of resultMap) {
    if (resultArr.length <= 0) continue;
    github.startGroup(resultFile);
    for (const result of resultArr) {
      total += 1;
      console.log(
        `::warning file=${resultFile},title=Invalid Link,line=${result.startLine ?? 0},endLine=${
          result.startLine ?? 0
        },col=${result.startColumn ?? 0},endColumn=${result.endColumn ?? result.startColumn ?? 0}::${
          result.title ?? "Invalid Link"
        }`,
      );
    }
    github.endGroup();
  }
  if (total > 0) {
    github.setFailed("One or more links are invalid!");
  }
}

if (results.size > 0) {
  if (process.env.GITHUB_ACTIONS) {
    annotateResults(results);
  } else {
    printResults(results);
  }
}
