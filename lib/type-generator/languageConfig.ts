import Go from "@components/icons/Go";
import Python from "@components/icons/Python";
import Rust from "@components/icons/Rust";
import TypeScript from "@components/icons/TypeScript";

export const LANGUAGE_CONFIG = {
  Python: {
    label: "Python",
    icon: Python,
    loadGenerator: () =>
      import("./python").then((m) => (ref: HTMLTableElement) => new m.PythonGenerator(ref).generateCode()),
  },
  TypeScript: {
    label: "TypeScript",
    icon: TypeScript,
    loadGenerator: () =>
      import("./typescript").then((m) => (ref: HTMLTableElement) => new m.TypescriptGenerator(ref).generateCode()),
  },
  Rust: {
    label: "Rust",
    icon: Rust,
    loadGenerator: () =>
      import("./rust").then((m) => (ref: HTMLTableElement) => new m.RustGenerator(ref).generateCode()),
  },
  Go: {
    label: "Go",
    icon: Go,
    loadGenerator: () => import("./go").then((m) => (ref: HTMLTableElement) => new m.GoGenerator(ref).generateCode()),
  },
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;
