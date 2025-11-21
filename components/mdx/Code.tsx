import classNames from "@lib/classnames";
import { Highlight, Prism, type Language as TLanguage } from "prism-react-renderer";
import { DetailedHTMLProps, HTMLAttributes, ReactNode } from "react";
import CopyButton from "../Copy";
import { CopyIcon } from "./icons/CopyIcon";

Prism.languages.http = {
  "request-line": {
    pattern: /^(?:POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\s(?:https?:\/\/|\/)\S+\sHTTP\/[0-9.]+/m,
    inside: {
      "property": /^(?:POST|GET|PUT|DELETE|OPTIONS|PATCH|TRACE|CONNECT)\b/,
      "attr-name": /:\/\/\S+/,
      "string": /\S+(?=\sHTTP\/)/,
      "important": /HTTP\/[0-9.]+/,
    },
  },
  "response-status": {
    pattern: /^HTTP\/[0-9.]+\s\d+\s.+/m,
    inside: {
      important: /HTTP\/[0-9.]+/,
      property: /\d{3}/,
      string: /.+/,
    },
  },
  "header": {
    pattern: /^[\w-]+:(?=.)/m,
    alias: "keyword",
  },
};

// This isn't exported for some reason
type Token = {
  types: string[];
  content: string;
  empty?: boolean;
};
type Language = TLanguage | "terminal" | "text";

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

interface ICodeProps {
  // we know this is going to be a string
  children?: ReactNode;
  className?: string;
  file?: string | true;
  noCopy?: boolean;
  forceCopy?: boolean;
  isTerminal?: boolean;
  hasLines?: boolean;
}

type CodeProps = ICodeProps & Omit<DetailedHTMLProps<HTMLAttributes<Element>, Element>, keyof ICodeProps>;

// TODO: This module needs some love
export default function Code({ children, className, file, ...props }: CodeProps) {
  if (typeof children !== "string") throw new Error("Code content is not a string");

  const propList = ["copy", "terminal", "no-lines"];

  const language: Language = className ? (className.replace(/language-/, "") as Language) : "text";

  const breakWords = propList.includes(language!);

  const hasCopy = !(props.noCopy || language === "json") || props.forceCopy;
  const isTerminal = props.isTerminal || language === "terminal";
  const hasLines = file != null || props.hasLines;

  const lineNumberClasses = classNames("line_number inline-block w-6 text-right leading-6 select-none");

  return (
    <div className="code-block relative my-3 rounded-md font-mono">
      <Highlight code={children} language={language! as TLanguage} theme={{ styles: [], plain: {} }}>
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
              "relative m-0 inline-grid w-full grid-rows-max-content overflow-auto leading-normal",
              blockClassName,
            )}
          >
            <code className="rounded-md p-4 px-1.5">
              {cleanTokens(tokens).map((line: Token[], i: number) => {
                const lineClass: Record<string, string> = {};
                let isDiff = false;
                let diffSymbol = "";

                if (
                  Object.values(SYMBOLS).includes(line[0]?.content?.[0] as string) ||
                  (line[0]?.content === "" && Object.values(SYMBOLS).includes(line[1]?.content as string))
                ) {
                  diffSymbol = line[0]?.content?.length ? line[0].content[0] : line[1].content;

                  lineClass.backgroundColor = diffBgColorMap[diffSymbol as keyof typeof diffBgColorMap];

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
