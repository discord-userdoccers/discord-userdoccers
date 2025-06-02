// @ts-nocheck
// TODO: Fix types

import classNames from "classnames";
import Highlight, { defaultProps, Prism } from "prism-react-renderer";
import { DetailedHTMLProps, ReactNode } from "react";

import CopyButton from "../Copy";
import CopyIcon from "../icons/Copy";
// import FileIcon from "../icons/File";

// Extend base classes
globalThis.Prism = Prism;

const diffBgColorMap = {
  "+": "var(--prism-highlight-add)",
  "-": "var(--prism-highlight-delete)",
  "|": "var(--prism-highlight)",
};

const SYMBOLS = {
  normal: "|",
  add: "+",
  delete: "-",
};

function cleanTokens(tokens: Token[][]): Token[][] {
  const tokensLength = tokens.length;

  if (tokensLength === 0) {
    return tokens;
  }

  const lastToken = tokens[tokensLength - 1];

  if (lastToken.length === 1 && lastToken[0].empty) {
    return tokens.slice(0, tokensLength - 1);
  }

  return tokens;
}

// interface InfoBarProps {
//   fileName?: string | null;
//   language: string;
// }

// function InfoBar({ fileName, language }: InfoBarProps) {
//   return (
//     <div className="flex mb-2 text-black dark:text-white text-sm font-bold">
//       {fileName == null ? null : (
//         <span className="inline-flex items-center">
//           <FileIcon className="mr-2 w-4 h-4" />
//           {fileName}
//         </span>
//       )}
//       <span className="ml-auto">{language}</span>
//     </div>
//   );
// }

interface ICodeProps {
  // we know this is going to be a string
  children?: ReactNode;
  className?: string;
  file?: string | true;
}

type CodeProps = ICodeProps & Omit<DetailedHTMLProps, keyof ICodeProps>;

// TODO: This module needs some love
export default function Code({ children, className, file, ...props }: CodeProps) {
  if (typeof children !== "string") throw new Error("Code content is not a string");

  const propList = ["copy", "terminal", "no-lines"];

  const language = className?.replace(/language-/, "");
  const breakWords = propList.includes(language);

  const hasCopy = !(props.noCopy || language === "json");
  const isTerminal = props.terminal || language === "terminal";
  const hasLines = file != null || props.lines;

  const lineNumberClasses = classNames("line_number inline-block w-6 text-right leading-6 select-none");

  return (
    <div className="code-block relative my-3 rounded-md font-mono">
      {/* <InfoBar fileName={file} language={language} /> */}
      <Highlight {...defaultProps} code={children} language={language}>
        {({
          className: blockClassName,
          tokens,
          getLineProps,
          getTokenProps,
        }: {
          className: string;
          tokens: Token[][];
          getLineProps: (options: { line: Token[]; key: number }) => React.HTMLAttributes<HTMLElement>;
          getTokenProps: (options: { token: Token; key: number }) => React.HTMLAttributes<HTMLElement>;
        }) => (
          <pre
            className={classNames(
              "relative m-0 mb-4 inline-grid w-full grid-rows-max-content overflow-auto leading-normal",
              blockClassName,
            )}
          >
            <code className="rounded-md p-4 px-1.5">
              {cleanTokens(tokens).map((line: Token[], i: number) => {
                const lineClass = {};
                let isDiff = false;
                let diffSymbol = "";

                if (
                  Object.values(SYMBOLS).includes(line[0]?.content?.[0] as string) ||
                  (line[0]?.content === "" && Object.values(SYMBOLS).includes(line[1]?.content as string))
                ) {
                  diffSymbol = line[0]?.content?.length ? line[0].content[0] : line[1].content;

                  lineClass.backgroundColor = diffBgColorMap[diffSymbol];

                  isDiff = true;
                }

                const lineProps = getLineProps({ line, key: i });

                return (
                  <div className="block" key={i + 1} {...lineProps} style={lineClass}>
                    {isTerminal && !isDiff && <span className={lineNumberClasses}>$</span>}
                    {!isTerminal && !isDiff && hasLines && <span className={lineNumberClasses}>{i + 1}</span>}
                    {isDiff && hasLines && (
                      <span className={lineNumberClasses} style={{ color: lineClass.color }}>
                        {["+", "-"].includes(diffSymbol) ? diffSymbol : i + 1}
                      </span>
                    )}
                    <span
                      className={classNames("line_content px-4", {
                        "has-copy-button": hasCopy,
                        "inline-table break-words": breakWords,
                      })}
                    >
                      {line.map((token, key) => {
                        if (
                          isDiff &&
                          (key === 0 || key === 1) &&
                          Object.values(SYMBOLS).includes(token.content.charAt(0) as string)
                        ) {
                          return (
                            // eslint-disable-next-line react/jsx-key
                            <span
                              {...getTokenProps({
                                token: {
                                  ...token,

                                  content: token.content.slice(1),
                                },
                                key,
                              })}
                            />
                          );
                        }
                        // eslint-disable-next-line react/jsx-key
                        return <span {...getTokenProps({ token, key })} />;
                      })}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        )}
      </Highlight>
      {hasCopy && (
        <div className="copy-button-wrapper group absolute right-0 top-0 h-12 w-12">
          <div className="copy-button absolute right-2 top-2 hidden rounded-md p-3 transition group-hover:block">
            <CopyButton text={children}>
              <CopyIcon className="w-5" />
            </CopyButton>
          </div>
        </div>
      )}
    </div>
  );
}
