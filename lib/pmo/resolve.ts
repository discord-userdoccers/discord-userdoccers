import chalk from "chalk";
import type { RootContent } from "mdast";
import type {
  BinaryExpression,
  EnumDeclaration,
  EnumMember,
  InterfaceDeclaration,
  JSDoc,
  JSDocContainer,
  NodeArray,
  NumericLiteral,
  PropertyName,
  QualifiedName,
  Statement,
  StringLiteral,
  TypeElement,
  TypeNode,
  TypeReferenceNode,
} from "typescript";
import ts from "typescript";
import type { PMO } from "./types";

export class Resolver {
  resolve(statements: NodeArray<Statement>) {
    const nodes: RootContent[] = [];

    // TODO: tables and footnotes
    // TODO: create JSX component that wraps the table
    // TODO: pass prop + doc data to said JSX component
    // TODO: use the JSX component for (better) codegen
    for (const statement of statements) {
      switch (statement.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          const struct = this.resolveStructure(statement as InterfaceDeclaration);

          nodes.push({
            type: "code",
            lang: "json",
            value: JSON.stringify(struct, undefined, 2),
          });

          break;
        case ts.SyntaxKind.EnumDeclaration:
          const enumeration = this.resolveEnum(statement as EnumDeclaration);

          nodes.push({
            type: "code",
            lang: "json",
            value: JSON.stringify(enumeration, undefined, 2),
          });

          break;
      }
    }

    return nodes;
  }

  resolveStructure(decl: InterfaceDeclaration) {
    const name = decl.name.text;

    const structure: PMO.Structure = {
      type: "structure",
      name,
      description: getDescription(decl),
      properties: this.resolveStructureProperties(name, decl.members),
    };

    return structure;
  }

  resolveStructureProperties(container: string, members: NodeArray<TypeElement>) {
    const properties: PMO.Property[] = [];

    for (const member of members) {
      if (!ts.isPropertySignature(member) || member.type == null) {
        throw error("contains a member that isn't a property signature or doesn't have a type", container);
      }

      if (member.name == null) {
        throw error("contains a member without a name", container);
      }

      const name = this.resolvePropertyName(container, member.name);
      const tags = getTags(container, name, member);

      const verbatimType = this.resolveType(container, name, member.type);

      const { nullable, type } = this.resolveNullable(verbatimType);

      properties.push({
        name: name,
        description: getDescription(member),
        ...tags,
        optional: member.questionToken != null,
        nullable,
        type,
      });
    }

    return properties;
  }

  resolveEnum(decl: EnumDeclaration): PMO.Enum | PMO.Flags {
    const type = this.resolveEnumType(decl);

    const name = decl.name.text;
    const description = getDescription(decl);

    if (type === "enum") {
      return {
        type: "enum",
        name,
        description,
        variants: this.resolveEnumMembers(name, decl.members, "enum"),
      };
    }

    return {
      type: "flags",
      name,
      description,
      flags: this.resolveEnumMembers(name, decl.members, "flags"),
    };
  }

  resolveEnumType(decl: EnumDeclaration) {
    const container = decl.name.text;

    let flagLikeCount = 0;

    for (const member of decl.members) {
      const name = this.resolvePropertyName(container, member.name);

      if (member.initializer == null) {
        throw error("doesn't have an initializer", container, name);
      }

      const initializer = member.initializer;

      if (ts.isNumericLiteral(initializer) || ts.isStringLiteral(initializer)) {
        continue;
      }

      if (!ts.isBinaryExpression(initializer)) {
        throw error("expected binary expression", container, name);
      }

      if (initializer.operatorToken.kind !== ts.SyntaxKind.LessThanLessThanToken) {
        throw error("expected a `<<` token", container, name);
      }

      if (!ts.isNumericLiteral(initializer.left) || !ts.isNumericLiteral(initializer.right)) {
        throw error("shoud have numeric literals on both sides of the binary expression", container, name);
      }

      flagLikeCount += 1;
    }

    if (flagLikeCount > 0) {
      if (flagLikeCount != decl.members.length) {
        throw error("has flag-like initializers mixed in with non-flag-like initializers", container);
      }

      if (!container.endsWith("Flags")) {
        throw error("flags name must end with `Flags`", container);
      }

      return "flag";
    }

    return "enum";
  }

  resolveEnumMembers<const T extends "flags" | "enum">(container: string, members: NodeArray<EnumMember>, type: T) {
    const resolved: (PMO.Variant | PMO.Flag)[] = [];

    for (const member of members) {
      const name = this.resolvePropertyName(container, member.name);
      const description = getDescription(member);
      const tags = getTags(container, name, member);

      // 2 assumptions
      // 1. `this.resolveEnumType` has been called
      // 2. `type` is the same as the resolved type
      //
      // the following lines will work under these assumption

      const initializer = member.initializer!;

      if (type === "enum") {
        const value = ts.isNumericLiteral(initializer)
          ? parseInt(initializer.text)
          : (initializer as StringLiteral).text;

        resolved.push({
          name,
          description,
          ...tags,
          value,
        });

        continue;
      }

      // again, same assumptions as above
      const binary = initializer as BinaryExpression;
      const left = binary.left as NumericLiteral;
      const right = binary.right as NumericLiteral;

      const initial = parseInt(left.text);
      const shift = parseInt(right.text);

      resolved.push({
        name,
        description,
        ...tags,
        initial,
        shift,
      });
    }

    return resolved as T extends "enum" ? PMO.Variant[] : PMO.Flag[];
  }

  resolvePropertyName(container: string, name: PropertyName) {
    switch (name.kind) {
      case ts.SyntaxKind.NumericLiteral:
      case ts.SyntaxKind.StringLiteral:
      case ts.SyntaxKind.Identifier:
        return name.text;
      default:
        throw error("contains a member with invalid name", container);
    }
  }

  resolveType(container: string, member: string, node: TypeNode): PMO.Types.Any {
    if (node.kind === ts.SyntaxKind.StringKeyword) {
      return {
        type: "primitive",
        kind: "string",
      };
    } else if (node.kind === ts.SyntaxKind.BooleanKeyword) {
      return {
        type: "primitive",
        kind: "boolean",
      };
    } else if (ts.isLiteralTypeNode(node)) {
      // TODO: maybe string and number literals?
      if (node.literal.kind !== ts.SyntaxKind.NullKeyword) {
        throw error("is a literal that isn't null", container, member);
      }

      return {
        type: "primitive",
        kind: "null",
      };
    } else if (ts.isUnionTypeNode(node)) {
      return {
        type: "union",
        elements: node.types.map((type) => this.resolveType(container, member, type)),
      };
    } else if (ts.isArrayTypeNode(node)) {
      return {
        type: "array",
        element: this.resolveType(container, member, node.elementType),
      };
    } else if (ts.isTupleTypeNode(node)) {
      return {
        type: "tuple",
        elements: node.elements.map((element) => this.resolveType(container, member, element)),
      };
    } else if (ts.isTypeReferenceNode(node)) {
      return this.resolveTypeReference(container, member, node);
    }

    throw error("contains a member with unhandled type", container, member);
  }

  resolveTypeReference(container: string, member: string, node: TypeReferenceNode): PMO.Types.Any {
    if (ts.isQualifiedName(node.typeName)) {
      return {
        type: "reference",
        path: this.resolveQualifiedName(node.typeName),
      };
    }

    switch (node.typeName.text) {
      case "Snowflake":
        return {
          type: "snowflake",
        };
      case "Date":
        return {
          type: "date",
        };
      case "Integer":
        return {
          type: "primitive",
          kind: "integer",
        };
      case "Float":
        return {
          type: "primitive",
          kind: "float",
        };
      case "Record":
        return {
          type: "map",
          key: this.resolveType(container, member, node.typeArguments![0]),
          value: this.resolveType(container, member, node.typeArguments![1]),
        };
      default:
        throw error("contains a member with invalid type reference", container, member);
    }
  }

  resolveQualifiedName(node: QualifiedName) {
    const path: string[] = [];

    if (ts.isQualifiedName(node.left)) {
      path.push(...this.resolveQualifiedName(node.left));
    } else {
      path.push(node.left.text);
    }

    path.push(node.right.text);

    return path;
  }

  resolveNullable(type: PMO.Types.Any) {
    // only a top level union indicates nullability
    if (type.type != "union") return { nullable: false, type };

    const filtered = type.elements.filter((t) => t.type !== "primitive" || t.kind !== "null");

    // edge case for `null | null` union type
    // although it's a useless consideration so i will not be implementing that
    const newType: PMO.Types.Any =
      filtered.length === 1
        ? filtered[0]
        : {
            type: "union",
            elements: filtered,
          };

    return { nullable: filtered.length != type.elements.length, type: newType };
  }
}

export function error(message: string, container?: string, member?: string) {
  const prefix = container != null ? ` ${container}${member != null ? `.${member}` : ""}` : "";

  return new Error(`${chalk.red("⨯")} pmo definition${chalk.blue(prefix)}: ${chalk.yellow(message)}`);
}

function getJSDoc<T extends JSDocContainer>(node: T) {
  return (node as { jsDoc?: JSDoc[] }).jsDoc;
}

function getTags<T extends JSDocContainer>(container: string, member: string, node: T) {
  const jsdoc = getJSDoc(node);

  const tags: Pick<PMO.Member, "deprecated" | "deleted" | "notes"> = {
    deprecated: false,
    deleted: false,
    notes: [],
  };

  if (jsdoc == null) return tags;

  for (const doc of jsdoc) {
    if (doc.tags == null) continue;

    for (const tag of doc.tags) {
      switch (tag.tagName.text) {
        case "deleted":
          tags.deleted = true;

          break;
        case "deprecated":
          tags.deprecated = stringifyJSDoc(tag.comment) ?? true;

          break;
        case "note": {
          const note = stringifyJSDoc(tag.comment);

          if (note == null) {
            throw error(`contains an empty note`, container, member);
          }

          tags.notes.push(note);

          break;
        }
      }
    }
  }

  return tags;
}

function getDescription<T extends JSDocContainer>(node: T) {
  const jsdoc = getJSDoc(node);

  if (jsdoc == null) return null;

  return jsdoc.map((doc) => stringifyJSDoc(doc.comment) ?? "").join(" ");
}

function stringifyJSDoc(comment: JSDoc["comment"]) {
  if (comment == null) return null;

  if (typeof comment === "string") return comment;

  return comment.map((com) => com.text).join(" ");
}
