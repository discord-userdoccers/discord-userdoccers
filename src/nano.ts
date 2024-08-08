import { atom, batched } from "nanostores";

export const browserTheme = atom<"light" | "dark">("dark");
export const userTheme = atom<"light" | "dark" | "system">("system");

export const theme = batched([browserTheme, userTheme], (browser, user) => {
	if (user === "system") {
		return browser;
	}
	return user;
});
