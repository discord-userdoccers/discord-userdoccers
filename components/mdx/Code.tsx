// @ts-nocheck

import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import { Prism } from "prism-react-renderer";
import rangeParser from "parse-numeric-range";
import classnames from "classnames";

import FileIcon from "../icons/File";
import CopyIcon from "../icons/Copy";
import CopyButton from "../Copy";
import classNames from "classnames";

// Extend base classes
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-docker");

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

function cleanTokens(tokens: any) {
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

function InfoBar({ fileName, language }) {
  return (
    <div className="flex mb-2 text-black dark:text-white text-sm font-bold">
      {fileName != null ? (
        <span className="inline-flex items-center">
          <FileIcon className="mr-2 w-4 h-4" />
          {fileName}
        </span>
      ) : null}
      <span className="ml-auto">{language}</span>
    </div>
  );
}

// TODO: This module needs some love
export default function Code({
  children,
  className,
  metastring,
  file,
  ...props
}) {
  const propList = ["copy", "terminal", "no-lines"];

  const language = className && className.replace(/language-/, "");
  let breakWords = false;

  if (propList.includes(language)) {
    breakWords = true;
  }

  const hasCopy = props.copy || language === "copy";
  const isTerminal = props.terminal || language === "terminal";
  const hasLines = file != null || props.lines;

  const lineNumberClasses = classNames(
    "line_number inline-block w-6 text-right leading-6 select-none"
  );

  return (
    <div className="code-block relative my-6 font-mono rounded-md">
      <InfoBar fileName={file} language={language} />
      <Highlight {...defaultProps} code={children} language={language}>
        {({
          className: blockClassName,
          style,
          tokens,
          getLineProps,
          getTokenProps,
        }) => (
          <pre
            className={classnames(
              "relative mb-4 overflow-auto leading-normal inline-grid w-full grid-rows-max-content m-0",
              blockClassName
            )}
          >
            {(props.copy || language === "copy") && (
              <div className="copy-button">
                <CopyButton text={children}>
                  <CopyIcon />
                </CopyButton>
              </div>
            )}
            <code className="p-4 px-1.5 rounded-md">
              {cleanTokens(tokens).map((line, i) => {
                const lineClass = {};
                let isDiff = false;
                let diffSymbol = "";

                if (
                  Object.values(SYMBOLS).includes(line?.[0]?.content?.[0]) ||
                  (line?.[0]?.content === "" &&
                    Object.values(SYMBOLS).includes(line?.[1]?.content))
                ) {
                  diffSymbol = line?.[0]?.content?.length
                    ? line[0].content[0]
                    : line[1].content;

                  lineClass.backgroundColor = diffBgColorMap[diffSymbol];

                  isDiff = true;
                }

                const lineProps = getLineProps({ line, key: i });

                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    className="block"
                    key={line + i}
                    {...lineProps}
                    style={lineClass}
                  >
                    {isTerminal && !isDiff && (
                      <span className={lineNumberClasses}>$</span>
                    )}
                    {!isTerminal && !isDiff && hasLines && (
                      <span className={lineNumberClasses}>{i + 1}</span>
                    )}
                    {isDiff && hasLines && (
                      <span
                        className={lineNumberClasses}
                        style={{ color: lineClass.color }}
                      >
                        {["+", "-"].includes(diffSymbol) ? diffSymbol : i + 1}
                      </span>
                    )}
                    <span
                      className={classnames("line_content px-4", {
                        "has-copy-button": hasCopy,
                        "inline-table break-words": breakWords,
                      })}
                    >
                      {line.map((token, key) => {
                        if (
                          isDiff &&
                          (key === 0 || key === 1) &&
                          Object.values(SYMBOLS).includes(
                            token.content.charAt(0)
                          )
                        ) {
                          return (
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
    </div>
  );
}
