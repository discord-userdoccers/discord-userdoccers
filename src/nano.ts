import { atom, batched, type ReadableAtom } from "nanostores";

export function createSelector<T>(source: ReadableAtom<T>): (key: T, listener: (value: boolean) => void) => void {
	const m = new Map<T, ((v: boolean) => void)[]>();
	source.listen((newValue, oldValue) => {
		if (oldValue === newValue) return;
		for (const l of m.get(oldValue) ?? []) l(false);
		for (const l of m.get(newValue) ?? []) l(true);
	});


	return (key, listener) => {
		if (!m.has(key)) m.set(key, []);
		m.get(key)!.push(listener);
		listener(source.value === key);
	};
}

export const browserTheme = atom<"light" | "dark">("dark");
export const userTheme = atom<"light" | "dark" | "system">(localStorage.getItem("theme") as any || "system");
userTheme.listen((value) => {
	localStorage.setItem("theme", value);
});

export const theme = batched([browserTheme, userTheme], (browser, user) => {
	if (user === "system") {
		return browser;
	}
	return user;
});

theme.subscribe((value) => {
	localStorage.setItem("calculatedTheme", value);
})

export const path = atom<string>("/");
export const hash = atom<string>("");

export const menuOpen = atom(false);
