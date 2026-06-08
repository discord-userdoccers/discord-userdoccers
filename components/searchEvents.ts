// Shared module so the rest of the app can communicate with the lazy-loaded
// Searchbar dialog without statically importing it
let _openSearch: ((seed?: string) => void) | null = null;
let _pendingSeed: string | undefined | null = null;
let _pending = false;

let _preloaded = false;
function preload() {
  if (_preloaded) return;
  _preloaded = true;
  void import("./Searchbar");
}

export function registerOpenSearch(fn: (seed?: string) => void) {
  _openSearch = fn;
  if (_pending) {
    _pending = false;
    const seed = _pendingSeed ?? undefined;
    _pendingSeed = null;
    fn(seed);
  }
}

export function openSearch(seed?: string) {
  preload();
  if (_openSearch) {
    _openSearch(seed);
  } else {
    _pending = true;
    _pendingSeed = seed;
  }
}
