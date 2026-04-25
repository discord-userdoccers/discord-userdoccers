// Shared module so Menu.tsx and Searchbar.tsx can communicate without Menu statically importing Searchbar
let _openSearch: (() => void) | null = null;

export function registerOpenSearch(fn: () => void) {
  _openSearch = fn;
}

export function openSearch() {
  _openSearch?.();
}
