import Python from "@components/icons/Python";
import TypeScript from "@components/icons/TypeScript";

import { PythonGenerator } from "@lib/type-generator/python";
import { TypescriptGenerator } from "@lib/type-generator/typescript";

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
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;
