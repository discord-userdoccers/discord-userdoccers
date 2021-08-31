// @ts-nocheck

import React from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import { Prism } from "prism-react-renderer";
import rangeParser from "parse-numeric-range";
import classnames from "classnames";

import FileIcon from "../icons/File";
import CopyIcon from "../icons/Copy";
import CopyButton from "../Copy";

// Extend base classes
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-docker");

const diffBgColorMap = {
  "+": "var(--prism-highlight-added-background)",
  "-": "var(--prism-highlight-removed-background)",
  "|": "var(--prism-highlight-background)",
};

const symColorMap = {
  "+": "var(--prism-highlight-added-text)",
  "-": "var(--prism-highlight-removed-text)",
  "|": "var(--prism-highlight-text)",
};

const symbols = {
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

const propList = ["copy", "terminal", "no-lines"];

// TODO: This module needs some love
export default function Code({ children, className, ...props }) {
  const language = className && className.replace(/language-/, "");
  let breakWords = false;
  let diffArray = [];

  if (props?.metastring?.includes("highlight")) {
    const parts = props.highlight.split("|");
    parts.forEach((part) => {
      diffArray = [part.split(";"), ...diffArray];
    });
  }

  if (propList.includes(language)) {
    breakWords = true;
  }

  const code = children;
  const hasCopy = props.copy || language === "copy";
  const isTerminal = props.terminal || language === "terminal";
  const fileName = props.file || language === "file";
  const hasLines = fileName || props.lines;

  const tokenCopyClass = `${hasCopy ? "has-copy-button" : ""} ${
    breakWords ? "break-words" : ""
  }`;

  return (
    <div className="code-block">
      <div className="code-block_file">
        {fileName && (
          <span className="code-block_file_name">
            <FileIcon />
            {fileName}
          </span>
        )}
        <span className="code-block_file_language">{language}</span>
      </div>
      <div className="code-block_highlight">
        <Highlight {...defaultProps} code={code} language={language}>
          {({
            className: blockClassName,
            style,
            tokens,
            getLineProps,
            getTokenProps,
          }) => (
            <pre
              className={classnames(blockClassName, {
                "is-terminal": isTerminal,
              })}
              style={style}
            >
              {(props.copy || language === "copy") && (
                <div className="copy-button">
                  <CopyButton text={code}>
                    <CopyIcon />
                  </CopyButton>
                </div>
              )}
              <code>
                {cleanTokens(tokens).map((line, i) => {
                  let lineClass = {
                    backgroundColor: "",
                    symbColor: "",
                  };

                  let isDiff = false;
                  let diffSymbol = "";

                  if (
                    (!props?.metastring?.includes("plain") &&
                      line[0] &&
                      line[0].content.length &&
                      (line[0].content[0] === "+" ||
                        line[0].content[0] === "-" ||
                        line[0].content[0] === "|")) ||
                    (line[0] &&
                      line[0].content === "" &&
                      line[1] &&
                      (line[1].content === "+" ||
                        line[1].content === "-" ||
                        line[1].content === "|"))
                  ) {
                    diffSymbol =
                      line[0] && line[0].content.length
                        ? line[0].content[0]
                        : line[1].content;
                    lineClass = {
                      backgroundColor: diffBgColorMap[diffSymbol],
                      symbColor: symColorMap[diffSymbol],
                    };
                    isDiff = true;
                  }

                  if (diffArray.length !== 0) {
                    diffArray.forEach((arr) => {
                      if (rangeParser(arr[0]).includes(i + 1)) {
                        diffSymbol = symbols[arr[1]];
                        lineClass = {
                          backgroundColor: diffBgColorMap[diffSymbol],
                          symbColor: symColorMap[diffSymbol],
                        };
                        isDiff = props?.metastring?.includes("highlight");
                      }
                    });
                  }

                  const lineProps = getLineProps({ line, key: i });

                  lineProps.style = { ...lineClass };

                  return (
                    // eslint-disable-next-line react/no-array-index-key
                    <div className="line" key={line + i} {...lineProps}>
                      {isTerminal && !isDiff && (
                        <span className="line_number">$</span>
                      )}
                      {!isTerminal && !isDiff && hasLines && (
                        <span className="line_number">{i + 1}</span>
                      )}
                      {isDiff && hasLines && (
                        <span
                          className="line_number"
                          style={{ color: lineClass.symbColor }}
                        >
                          {["+", "-"].includes(diffSymbol) ? diffSymbol : i + 1}
                        </span>
                      )}
                      <span
                        className={classnames("line_content", tokenCopyClass)}
                      >
                        {line.map((token, key) => {
                          if (isDiff) {
                            if (
                              (key === 0 || key === 1) &&
                              (token.content.charAt(0) === "+" ||
                                token.content.charAt(0) === "-" ||
                                token.content.charAt(0) === "|")
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
    </div>
  );
}
