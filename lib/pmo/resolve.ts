import chalk from "chalk";
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
  *resolve(statements: NodeArray<Statement>): Generator<PMO.Model, undefined> {
    for (const statement of statements) {
      switch (statement.kind) {
        case ts.SyntaxKind.InterfaceDeclaration:
          yield this.resolveStructure(statement as InterfaceDeclaration);

          break;
        case ts.SyntaxKind.EnumDeclaration:
          yield this.resolveEnum(statement as EnumDeclaration);

          break;
      }
    }
  }

  resolveStructure(decl: InterfaceDeclaration): PMO.Structure {
    const name = decl.name.text;
    const columns: PMO.Base["columns"] = [];

    return {
      type: "structure",
      name,
      description: getDescription(decl),
      columns,
      properties: this.resolveStructureProperties(name, decl.members, columns),
    };
  }

  resolveStructureProperties(
    container: string,
    members: NodeArray<TypeElement>,
    columnList: PMO.Base["columns"],
  ): PMO.Property[] {
    const properties: PMO.Property[] = [];

    for (const member of members) {
      if (!ts.isPropertySignature(member) || member.type == null) {
        throw error("contains a member that isn't a property signature or doesn't have a type", container);
      }

      if (member.name == null) {
        throw error("contains a member without a name", container);
      }

      const columns: PMO.Member["columns"] = {};

      const name = this.resolvePropertyName(container, member.name);
      const tags = getTags(container, name, member, columnList, columns);

      const verbatimType = this.resolveType(container, name, member.type);

      const { nullable, type } = this.resolveNullable(verbatimType);

      properties.push({
        name: name,
        description: getDescription(member),
        ...tags,
        columns,
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
    const columns: PMO.Base["columns"] = [];

    if (type === "enum") {
      return {
        type,
        name,
        description,
        columns,
        variants: this.resolveEnumMembers(name, decl.members, columns, type),
      };
    }

    return {
      type,
      name,
      description,
      columns,
      flags: this.resolveEnumMembers(name, decl.members, columns, type),
    };
  }

  resolveEnumType(decl: EnumDeclaration): (PMO.Enum | PMO.Flags)["type"] {
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

      return "flags";
    }

    if (!container.endsWith("Type")) {
      throw error("flags name must end with `Type`", container);
    }

    return "enum";
  }

  resolveEnumMembers<const T extends (PMO.Enum | PMO.Flags)["type"]>(
    container: string,
    members: NodeArray<EnumMember>,
    columnList: PMO.Base["columns"],
    type: T,
  ): T extends PMO.Enum["type"] ? PMO.Variant[] : PMO.Flag[] {
    const resolved: (PMO.Variant | PMO.Flag)[] = [];

    for (const member of members) {
      const name = this.resolvePropertyName(container, member.name);
      const description = getDescription(member);

      const columns: PMO.Member["columns"] = {};
      const tags = getTags(container, name, member, columnList, columns);

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
          columns,
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
        columns,
        initial,
        shift,
      });
    }

    return resolved as T extends PMO.Enum["type"] ? PMO.Variant[] : PMO.Flag[];
  }

  resolvePropertyName(container: string, name: PropertyName): string {
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
    }

    if (node.kind === ts.SyntaxKind.BooleanKeyword) {
      return {
        type: "primitive",
        kind: "boolean",
      };
    }

    if (ts.isLiteralTypeNode(node)) {
      // TODO: maybe string and number literals?
      if (node.literal.kind !== ts.SyntaxKind.NullKeyword) {
        throw error("is a literal that isn't null", container, member);
      }

      return {
        type: "primitive",
        kind: "null",
      };
    }

    if (ts.isUnionTypeNode(node)) {
      return {
        type: "union",
        elements: node.types.map((type) => this.resolveType(container, member, type)),
      };
    }

    if (ts.isArrayTypeNode(node)) {
      return {
        type: "array",
        element: this.resolveType(container, member, node.elementType),
      };
    }

    if (ts.isTupleTypeNode(node)) {
      return {
        type: "tuple",
        elements: node.elements.map((element) => this.resolveType(container, member, element)),
      };
    }

    if (ts.isTypeReferenceNode(node)) {
      return this.resolveTypeReference(container, member, node);
    }

    throw error(`contains a member with unhandled type ${ts.SyntaxKind[node.kind]}`, container, member);
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

  resolveQualifiedName(node: QualifiedName): string[] {
    const path: string[] = [];

    if (ts.isQualifiedName(node.left)) {
      path.push(...this.resolveQualifiedName(node.left));
    } else {
      path.push(node.left.text);
    }

    path.push(node.right.text);

    return path;
  }

  resolveNullable(type: PMO.Types.Any): { nullable: boolean; type: PMO.Types.Any } {
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

export function error(message: string, container?: string, member?: string): Error {
  const prefix = container != null ? ` ${container}${member != null ? `.${member}` : ""}` : "";

  return new Error(`${chalk.red("⨯")} pmo definition${chalk.blue(prefix)}: ${chalk.yellow(message)}`);
}

function getJSDoc<T extends JSDocContainer>(node: T): JSDoc[] | undefined {
  return (node as { jsDoc?: JSDoc[] }).jsDoc;
}

function getTags<T extends JSDocContainer>(
  container: string,
  member: string,
  node: T,
  columnList: PMO.Base["columns"],
  columns: PMO.Member["columns"],
): Pick<PMO.Member, "deprecated" | "deleted" | "notes"> {
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
          let note: string | number | null = stringifyJSDoc(tag.comment);

          if (note == null) {
            throw error("contains an empty note tag", container, member);
          }

          if (/\*\d+$/.test(note)) {
            note = parseInt(note.slice(1));
          }

          tags.notes.push(note);

          break;
        }
        case "column":
          const comment = stringifyJSDoc(tag.comment);

          if (comment == null) {
            throw error("contains an empty column tag", container, member);
          }

          const colon = comment.indexOf(":");
          const name = comment.slice(0, colon);
          const content = comment.slice(colon + 1).trim();

          if (!columnList.includes(name)) {
            columnList.push(name);
          }

          columns[name] ??= "";
          columns[name] += ` ${content}`;
          columns[name] = columns[name].trim();
      }
    }
  }

  return tags;
}

function getDescription<T extends JSDocContainer>(node: T): string | null {
  const jsdoc = getJSDoc(node);

  if (jsdoc == null) return null;

  const desc = jsdoc.map((doc) => stringifyJSDoc(doc.comment) ?? "").join(" ");

  return desc.trim().length === 0 ? null : desc;
}

function stringifyJSDoc(comment: JSDoc["comment"]): string | null {
  if (comment == null) return null;

  if (typeof comment === "string") return comment;

  return comment.map((com) => com.text).join(" ");
}
