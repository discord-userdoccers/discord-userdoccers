import { readdirSync, statSync, readFileSync } from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';
import * as github from '@actions/core';
const cwd = process.env.GITHUB_ACTIONS ? process.env.GITHUB_WORKSPACE! : process.cwd();

function importDirectory(directory: string, extension: string, subdirectories: boolean = true) {
    try {
    const output = new Map<string, string>();
    const files = readdirSync(directory);
    const requestedFiles = files.filter(name => name.endsWith(extension));
    for (const file of requestedFiles) {
      const currentPath = `${directory}/${file}`;
      try {
        const read = readFileSync(currentPath, 'utf8');
        output.set(`/${file}`, read);
      } catch {
        // Discard error, file is not a file, but a directory
      }
    }
    if (subdirectories) {
      for (const possibleDir of files) {
        const path = `/${possibleDir}`;
        const currentPath = `${directory}${path}`
        if (statSync(currentPath).isDirectory()) {
          const subdir = importDirectory(currentPath, extension, subdirectories);
          if (!subdir) continue;
          for (const [name, read] of subdir) {
            output.set(`${path}${name}`, read);
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

function scanFile(regex: RegExp, index: number, name: string, splitFile: string[], valid: Map<string, string[]>, results: github.AnnotationProperties[]): void {
  let multilineCode = false;
  splitFile.forEach((line, lineNum) => {
    if (line.startsWith('```')) {
      multilineCode = !multilineCode;
      if (line.length > 3 && line.endsWith('```')) multilineCode = !multilineCode;
    }
    if (multilineCode) return;
    const matches = line.matchAll(regex);

    for (const match of matches) {
      const split = match[index].split('#')
      let url = split[0].endsWith('/') ? split[0].slice(0, -1) : split[0];
      if (match[index].startsWith('#')) url = name;
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

const htmlFiles = importDirectory(`${cwd}/.next/server/pages/`, '.html');

if (!htmlFiles) {
  console.error('No links found, ensure that build has been run!');
  process.exit(1);
}

const validLinks = new Map<string, string[]>();

let extLength = '.html'.length;

for (const [name, raw] of htmlFiles) {
  const keyName = name.slice(0, -extLength);
  if (!validLinks.has(keyName)) {
    validLinks.set(keyName, []);
  }
  const validAnchors = validLinks.get(keyName)!;
  const fragment = JSDOM.fragment(raw);
  // @ts-ignore
  const main = fragment.querySelector('main');
  if (!main) continue;
  const allIds = main.querySelectorAll('*[id]');
  for (const node of allIds.values()) {
    validAnchors.push(node.id);
  }
}

const results = new Map<string, github.AnnotationProperties[]>();

try {
  const navFile = '/components/Navigation.tsx'
  const nav = readFileSync(`${cwd}${navFile}`, 'utf8');
  const file = nav.split('\n')
  if (!results.has(navFile)) {
    results.set(navFile, []);
  }
  const ownResults = results.get(navFile)!;
  scanFile(/(?<!!)href=(["'])(?!(?:https?)|(?:mailto))(.+?)\1/g, 2, navFile.slice(0, -'.tsx'.length), file, validLinks, ownResults);
} catch {
  console.warn('Navigation file not found!');
}

const mdxFiles = importDirectory(`${cwd}/pages/`, '.mdx');

if (!mdxFiles) {
  console.error('No mdx files found!');
  process.exit(1);
}

extLength = '.mdx'.length;

for (const [name, raw] of mdxFiles) {
  const file = raw.split('\n');
  if (!results.has(name)) {
    results.set(name, []);
  }
  const ownResults = results.get(name)!;
  scanFile(/(?<![!`])\[.+?\]\((?!(?:https?)|(?:mailto))(.+?)\)(?!`)/g, 1, name.slice(0, -extLength), file, validLinks, ownResults);
}

function printResults(resultMap: Map<string, github.AnnotationProperties[]>): void {
  let output = '\n';
  let total = 0;
  for (const [resultFile, resultArr] of resultMap) {
    if (resultArr.length <= 0) continue;
    const filePath = path.resolve(`${cwd}/${resultFile}`);
    output += `${chalk.underline(filePath)}\n`;
    output += resultArr.reduce<string>((result, props) => {
      total += 1;
      return `${result}  ${props.startLine}:${props.startColumn}-${props.endColumn}  ${chalk.yellow('warning')}  ${props.title}\n`;
    }, '');
    output += '\n';
  }
  output += '\n';
  if (total > 0) {
    output += chalk.red.bold(`\u2716 ${total} problem${total === 1 ? '' : 's'}\n`);
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
        `::warning file=${resultFile},title=Invalid Link,line=${result.startLine},endLine=${result.startLine},` +
          `col=${result.startColumn},endColumn=${result.endColumn}::${result.title}`
        );
    }
    github.endGroup();
  }
  if (total > 0) {
    github.setFailed('One or more links are invalid!');
  }
}

if (results.size > 0) {
  if (process.env.GITHUB_ACTIONS) {
    annotateResults(results);
  } else {
    printResults(results);
  }
}
