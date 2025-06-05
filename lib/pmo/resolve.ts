import type { RootContent } from "mdast";
import type {
  InterfaceDeclaration,
  JSDoc,
  JSDocContainer,
  NodeArray,
  QualifiedName,
  Statement,
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
          break;
      }
    }

    return nodes;
  }

  resolveStructure(statement: InterfaceDeclaration) {
    const structure: PMO.Structure = {
      type: "structure",
      name: statement.name.text,
      description: getDescription(statement),
      properties: this.resolveStructureProperties(statement.name.text, statement.members),
    };

    return structure;
  }

  resolveStructureProperties(container: string, members: NodeArray<TypeElement>) {
    const properties: PMO.Property[] = [];

    for (const member of members) {
      if (!ts.isPropertySignature(member) || member.type == null) {
        throw new Error(
          `⚠ pmo definition ${container} contains a member that isn't a property signature or doesn't have a type`,
        );
      }

      if (member.name == null) {
        throw new Error(`⚠ pmo definition ${container} contains a member without a name`);
      }

      switch (member.name.kind) {
        case ts.SyntaxKind.NumericLiteral:
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.Identifier:
          break;
        default:
          throw new Error(`⚠ pmo definition ${container} contains a member with invalid name`);
      }

      const tags = getTags(container, member.name.text, member);

      const verbatimType = this.resolveType(container, member.name.text, member.type);

      const { nullable, type } = this.resolveNullable(verbatimType);

      properties.push({
        name: member.name.text,
        description: getDescription(member),
        deprecated: tags.deprecated,
        deleted: tags.deleted,
        notes: tags.notes,
        optional: member.questionToken != null,
        nullable,
        type,
      });
    }

    return properties;
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
        throw new Error(`⚠ pmo definition ${container}.${member} is a literal that isn't null`);
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

    throw new Error(`⚠ pmo definition ${container}.${member} contains a member with unhandled type`);
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
        throw new Error(`⚠ pmo definition ${container}.${member} contains a member with invalid type reference`);
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
            throw new Error(`⚠ pmo definition ${container}.${member} contains an empty note`);
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
