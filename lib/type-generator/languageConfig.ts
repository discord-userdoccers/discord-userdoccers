import Python from "@components/icons/Python";
import Rust from "@components/icons/Rust";
import Go from "@components/icons/Go";
import TypeScript from "@components/icons/TypeScript";
import { PythonGenerator } from "@lib/type-generator/python";
import { RustGenerator } from "@lib/type-generator/rust";
import { TypescriptGenerator } from "@lib/type-generator/typescript";
import { GoGenerator } from "@lib/type-generator/go";

export const LANGUAGE_CONFIG = {
  Python: {
    label: "Python",
    icon: Python,
    generator: (ref: HTMLTableElement) => new PythonGenerator(ref).generateCode(),
  },
  TypeScript: {
    label: "TypeScript",
    icon: TypeScript,
    generator: (ref: HTMLTableElement) => new TypescriptGenerator(ref).generateCode(),
  },
  Rust: {
    label: "Rust",
    icon: Rust,
    generator: (ref: HTMLTableElement) => new RustGenerator(ref).generateCode(),
  },
  Go: {
    label: "Go",
    icon: Go,
    generator: (ref: HTMLTableElement) => new GoGenerator(ref).generateCode(),
  },
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;
