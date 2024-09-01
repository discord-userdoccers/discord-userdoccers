/** @type {import("prettier").Config} */
export default {
	plugins: ["prettier-plugin-astro"],
	overrides: [
		{
			files: "*.astro",
			options: {
				parser: "astro",
			},
		},
		{
			files: ["*.md", "*.mdx"],
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
	],
	singleQuote: false,
	printWidth: 150,
	useTabs: true,
	trailingComma: "all",
};
