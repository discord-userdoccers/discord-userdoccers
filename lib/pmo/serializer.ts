import { Literal, Parent, PhrasingContent, RootContent, TableCell, TableRow } from "mdast";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import remarkSuperSub from "remark-supersub";
import { unified } from "unified";
import { error } from "./resolve";
import { PMO } from "./types";

type ParentNodes = {
  [N in RootContent as N["type"]]: N extends Parent ? N : never;
};

type LiteralNodes = {
  [N in RootContent as N["type"]]: N extends Literal ? N : never;
};

type Filter<T> = {
  // eslint-disable-next-line
  [K in keyof T]-?: T[K] extends {} ? T[K] : never;
}[keyof T];

type Args<T> = Filter<T> extends never ? [] : [T];

type NotesData = {
  notes: RootContent[];
  counter: number;
};

const PIPELINE = unified().use(remarkParse).use(remarkGfm).use(remarkMdx).use(remarkSuperSub);

export class Serializer {
  serialize(model: PMO.Model): RootContent[] {
    const data = JSON.stringify(model);

    return [literal("jsx", `<Model model={${data}}>`), ...this.serializeModel(model), literal("jsx", `</Model>`)];
  }

  serializeModel(model: PMO.Model): RootContent[] {
    switch (model.type) {
      case "structure":
        return this.serializeStructure(model);
      case "enum":
        return this.serializeEnum(model);
      case "flags":
        return this.serializeFlags(model);
    }
  }

  serializeGeneric<M>(
    formattedName: string,
    description: string,
    columns: PMO.Base["columns"],
    members: M[],
    rowSerializer: (member: M, notes: NotesData, columns: PMO.Base["columns"], container: string) => TableRow,
    realName?: string,
  ): RootContent[] {
    const notes: RootContent[] = [];

    const prelude: RootContent[] = [
      parent("heading", [literal("text", formattedName.replace(/(?<!^)[A-Z]/, " $&"))], { depth: 6 }),
      ...PIPELINE.parse(description).children,
    ];

    const table = parent("table", [
      parent(
        "tableRow",
        columns.map((column) => parent("tableCell", [literal("text", column)])),
      ),
      ...members.map((member) => rowSerializer(member, { notes, counter: 1 }, columns, realName ?? formattedName)),
    ]);

    return prelude.concat(table).concat(notes);
  }

  serializeRow(
    columnList: string[],
    columns: Record<string, string | PhrasingContent[]>,
    deleted: boolean,
    container: string,
    name: string,
  ): TableRow {
    const cells: TableCell[] = [];

    for (const column of columnList) {
      const value = columns[column];

      if (typeof value === "string") {
        // TableCell accepts any PhrasingContent
        // Paragraph children are PhrasingContent
        //
        // so that works I guess?
        const children = parseColumnString(value, container, name, column);

        cells.push(parent("tableCell", this.serializeDeleted(children, deleted)));

        continue;
      }

      if (value == null) {
        cells.push(parent("tableCell", []));

        continue;
      }

      cells.push(
        parent(
          "tableCell",
          value.some((node) => node.type === "delete") ? value : this.serializeDeleted(value, deleted),
        ),
      );
    }

    return parent("tableRow", cells);
  }

  serializeDeletedName(name: string, suffix: PhrasingContent[], deleted: boolean): PhrasingContent[] {
    return this.serializeDeleted([literal("text", name)], deleted).concat(suffix);
  }

  serializeNotes(
    data: NotesData,
    srcNotes: PMO.Member["notes"],
    container: string,
    name: string,
    column: string,
  ): PhrasingContent[] {
    const serialized: PhrasingContent[] = [];

    for (const note of srcNotes) {
      const superscript = typeof note === "number" ? note.toString() : data.counter.toString();
      const superNode = parent("superscript", [literal("text", superscript)], { data: { hName: "sup" } });

      serialized.push(literal("text", " "), superNode);

      if (typeof note === "number") continue;

      data.notes.push(
        parent("paragraph", [superNode, literal("text", " "), ...parseColumnString(note, container, name, column)]),
      );

      data.counter++;
    }

    return serialized;
  }

  serializeNameSuffix(
    notes: NotesData,
    srcNotes: PMO.Member["notes"],
    deprecated: PMO.Member["deprecated"],
    container: string,
    name: string,
  ): PhrasingContent[] {
    const nameSuffix = this.serializeNotes(notes, srcNotes, container, name, "Name");

    // TODO: handle string case
    if (deprecated) {
      nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
    }

    return nameSuffix;
  }

  serializeDescription(description: PMO.Member["description"], container: string, name: string): PhrasingContent[] {
    if (description == null) {
      return [];
    }

    return parseColumnString(description, container, name, "Description");
  }

  serializeStructure(structure: PMO.Structure): RootContent[] {
    return this.serializeGeneric(
      `${structure.name}Structure`,
      structure.description ?? "",
      ["Field", "Type", "Description"].concat(structure.columns),
      structure.properties,
      this.serializeStrucutureProperty.bind(this),
      structure.name,
    );
  }

  serializeStrucutureProperty(
    property: PMO.Property,
    notes: NotesData,
    columns: PMO.Base["columns"],
    container: string,
  ): TableRow {
    const name = property.name;

    const formattedName = `${name}${property.optional ? "" : "?"}`;
    const nameSuffix = this.serializeNameSuffix(notes, property.notes, property.deprecated, container, name);

    const nameNode = this.serializeDeletedName(formattedName, nameSuffix, property.deleted);
    const typeNode = this.serializeType(property.type);
    const descriptionNode = this.serializeDescription(property.description, container, name);

    return this.serializeRow(
      columns,
      {
        Field: nameNode,
        Type: typeNode,
        Description: descriptionNode,
        ...property.columns,
      },
      property.deleted,
      container,
      name,
    );
  }

  serializeType(type: PMO.Types.Any): PhrasingContent[] {
    switch (type.type) {
      case "snowflake":
        return [literal("text", "snowflake")];
      case "map":
        return [
          literal("text", "map["),
          ...this.serializeType(type.key),
          literal("text", ", "),
          ...this.serializeType(type.value),
          literal("text", "]"),
        ];
      case "date":
        return [literal("text", "ISO8601 Date")];
      case "primitive":
        return [literal("text", type.kind)];
      case "union":
        return this.serializeTypes(type.elements, " | ");
      case "array":
        return [literal("text", "array["), ...this.serializeType(type.element), literal("text", "]")];
      case "tuple":
        return [literal("text", "array["), ...this.serializeTypes(type.elements, ", "), literal("text", "]")];
      case "reference":
        const anchor = type.path.reduce((acc, path, index) => {
          let kebab = path.replaceAll(/(?<=[a-z])[A-Z]/g, "-$&").toLowerCase();

          if (index === type.path.length - 1) {
            if (!kebab.endsWith("-flags") || !kebab.endsWith("-type")) {
              kebab += "-structure";
            }

            return `${acc}#${kebab}`;
          }

          return `${acc}/${kebab}`;
        }, "");

        const last = type.path.at(-1)!;
        const trailer: PhrasingContent[] = !/(Type|Flags)$/.test(last) ? [literal("text", " object")] : [];

        return [
          parent("link", [{ type: "text", value: last }], { url: anchor, title: type.path.join(".") }),
          ...trailer,
        ];
    }
  }

  serializeTypes(types: PMO.Types.Any[], separator: string): PhrasingContent[] {
    return types.flatMap((type, index) => {
      const serialized = this.serializeType(type);

      if (index != types.length - 1) {
        serialized.push(literal("text", separator));
      }

      return serialized;
    });
  }

  serializeEnum(enumeration: PMO.Enum): RootContent[] {
    // I hate you dolfies,
    // I really dislike this but for the sake of consistency with CONTRIBUTING.md
    // (at the time of writing) enums with all string values will have their
    // names skipped
    const allString = !enumeration.variants.some((variant) => typeof variant.value === "number");
    const baseColumns = ["Value", ...(allString ? [] : ["Name"]), "Description"];

    return this.serializeGeneric(
      enumeration.name,
      enumeration.description ?? "",
      baseColumns.concat(enumeration.columns),
      enumeration.variants,
      this.serializeEnumVariant.bind(this),
    );
  }

  serializeEnumVariant(
    variant: PMO.Variant,
    notes: NotesData,
    columns: PMO.Base["columns"],
    container: string,
  ): TableRow {
    const name = variant.name;

    const nameSuffix = this.serializeNameSuffix(notes, variant.notes, variant.deprecated, container, name);

    const valueNode = [literal("text", variant.value.toString())];
    const nameNode = this.serializeDeletedName(name, nameSuffix, variant.deleted);
    const descriptionNode = this.serializeDescription(variant.description, container, name);

    return this.serializeRow(
      columns,
      {
        Value: valueNode,
        Name: nameNode,
        Description: descriptionNode,
        ...variant.columns,
      },
      variant.deleted,
      container,
      name,
    );
  }

  serializeFlags(flags: PMO.Flags): RootContent[] {
    return this.serializeGeneric(
      flags.name,
      flags.description ?? "",
      ["Value", "Name", "Description"],
      flags.flags,
      this.serializeFlagsFlag.bind(this),
    );
  }

  serializeFlagsFlag(flag: PMO.Flag, notes: NotesData, columns: PMO.Base["columns"], container: string): TableRow {
    const name = flag.name;

    const nameSuffix = this.serializeNameSuffix(notes, flag.notes, flag.deprecated, container, name);

    const valueNode = [literal("text", `${flag.initial} << ${flag.shift}`)];
    const nameNode = this.serializeDeletedName(name, nameSuffix, flag.deleted);
    const descriptionNode = this.serializeDescription(flag.description, container, name);

    return this.serializeRow(
      columns,
      {
        Value: valueNode,
        Name: nameNode,
        Description: descriptionNode,
        ...flag.columns,
      },
      flag.deleted,
      container,
      name,
    );
  }

  serializeDeleted(content: PhrasingContent[], deleted: boolean): PhrasingContent[] {
    if (!deleted) return content;

    return [parent("delete", content)];
  }
}

function parseColumnString(content: string, container: string, name: string, column: string): PhrasingContent[] {
  const root = PIPELINE.parse(content);

  if (root.children.length === 0) {
    throw error(`expected ≥1 children in column \`${column}\``, container, name);
  }

  const children: PhrasingContent[] = [];

  for (const node of root.children) {
    if (node.type != "paragraph") {
      throw error(`column \`${column}\` has a non-paragraph value`, container, name);
    }

    children.push(...node.children);
  }

  return children;
}

function parent<T extends keyof ParentNodes>(
  type: T,
  children: ParentNodes[T]["children"],
  ...args: Args<Omit<ParentNodes[T], "type" | "children">>
): ParentNodes[T] {
  return {
    type,
    children,
    ...args[0],
  } as ParentNodes[T];
}

function literal<T extends keyof LiteralNodes>(
  type: T,
  value: LiteralNodes[T]["value"],
  ...args: Args<Omit<ParentNodes[T], "type" | "value">>
): LiteralNodes[T] {
  return {
    type,
    value,
    ...args[0],
  } as LiteralNodes[T];
}
