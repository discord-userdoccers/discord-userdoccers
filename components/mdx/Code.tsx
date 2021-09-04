// @ts-nocheck

import React from "react";
import Highlight, { Prism, defaultProps } from "prism-react-renderer";
import classNames from "classnames";

import FileIcon from "../icons/File";
import CopyIcon from "../icons/Copy";
import CopyButton from "../Copy";

// Extend base classes
(typeof global === "undefined" ? window : global).Prism = Prism;
import("prismjs/components/prism-docker");

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

interface InfoBarProps {
	fileName?: string | null;
	language: string;
}

function InfoBar({ fileName, language }: InfoBarProps) {
	return (
		<div className="flex mb-2 text-black dark:text-white text-sm font-bold">
			{fileName == null ? null : (
				<span className="inline-flex items-center">
					<FileIcon className="mr-2 w-4 h-4" />
					{fileName}
				</span>
			)}
			<span className="ml-auto">{language}</span>
		</div>
	);
}

interface CodeProps {
	children?: string;
	className?: string;
	metastring?: string;
	file?: string | true;
	[prop: string]: string | true;
}

// TODO: This module needs some love
export default function Code({ children, className, metastring, file, ...props }: CodeProps) {
	const propList = ["copy", "terminal", "no-lines"];

	const language = className?.replace(/language-/, "");
	let breakWords = false;

	if (propList.includes(language)) {
		breakWords = true;
	}

	/* eslint-disable react/prop-types */
	const hasCopy = props.copy || language === "copy";
	const isTerminal = props.terminal || language === "terminal";
	const hasLines = file != null || props.lines;
	/* eslint-enable react/prop-types */

	const lineNumberClasses = classNames("line_number inline-block w-6 text-right leading-6 select-none");

	return (
		<div className="code-block relative my-6 font-mono rounded-md">
			<InfoBar fileName={file} language={language} />
			<Highlight {...defaultProps} code={children} language={language}>
				{({ className: blockClassName, tokens, getLineProps, getTokenProps }) => (
					<pre
						className={classNames(
							"relative inline-grid grid-rows-max-content m-0 mb-4 w-full leading-normal overflow-auto",
							blockClassName,
						)}
					>
						{/* eslint-disable-next-line react/prop-types */}
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
									Object.values(SYMBOLS).includes(line[0]?.content?.[0]) ||
									(line[0]?.content === "" && Object.values(SYMBOLS).includes(line[1]?.content))
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
													Object.values(SYMBOLS).includes(token.content.charAt(0))
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
