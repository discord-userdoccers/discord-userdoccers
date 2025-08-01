import Python from "@components/icons/Python";
import Rust from "@components/icons/Rust";
import TypeScript from "@components/icons/TypeScript";
import { RouteHeaderProps } from "@components/RouteHeader";
import { PythonEndpointGenerator } from "./endpoint/python";
import { RustEndpointGenerator } from "./endpoint/rust";
import { TypescriptEndpointGenerator } from "./endpoint/typescript";
import { PythonTableGenerator } from "./table/python";
import { RustTableGenerator } from "./table/rust";
import { TypescriptTableGenerator } from "./table/typescript";

export const LANGUAGE_CONFIG = {
  Python: {
    label: "Python",
    icon: Python,
    tableGenerator: (ref: HTMLTableElement) => new PythonTableGenerator(ref).generateCode(),
    endpointGenerator: (ref: HTMLDivElement, info: RouteHeaderProps) =>
      new PythonEndpointGenerator(ref, info).generateCode(),
  },
  TypeScript: {
    label: "TypeScript",
    icon: TypeScript,
    tableGenerator: (ref: HTMLTableElement) => new TypescriptTableGenerator(ref).generateCode(),
    endpointGenerator: (ref: HTMLDivElement, info: RouteHeaderProps) =>
      new TypescriptEndpointGenerator(ref, info).generateCode(),
  },
  Rust: {
    label: "Rust",
    icon: Rust,
    tableGenerator: (ref: HTMLTableElement) => new RustTableGenerator(ref).generateCode(),
    endpointGenerator: (ref: HTMLDivElement, info: RouteHeaderProps) =>
      new RustEndpointGenerator(ref, info).generateCode(),
  },
} as const;

export type Language = keyof typeof LANGUAGE_CONFIG;
