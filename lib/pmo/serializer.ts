import { Literal, Parent, PhrasingContent, RootContent, TableRow } from "mdast";
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

// TODO: deduplicate this code
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

  serializeGeneric(
    name: string,
    description: string,
    columns: PMO.Base["columns"],
    rows: TableRow[],
    notes: RootContent[],
  ) {
    const prelude: RootContent[] = [
      parent("heading", [literal("text", name.replace(/(?<!^)[A-Z]/, " $&"))], { depth: 6 }),
      // TODO: parse description as markdown
      parent("paragraph", [literal("text", description)]),
    ];

    const table = parent("table", [
      parent(
        "tableRow",
        columns.map((column) => parent("tableCell", [literal("text", column)])),
      ),
      ...rows,
    ]);

    return prelude.concat(table).concat(notes);
  }

  serializeGenericRow(
    nameFirst: boolean,
    name: string,
    nameSuffix: PhrasingContent[],
    second: PhrasingContent[],
    third: PhrasingContent[],
    columnList: string[],
    columns: PMO.Member["columns"],
    deleted: boolean,
  ) {
    const first = parent("tableCell", this.serializeDeleted([literal("text", name)], deleted).concat(nameSuffix));
    const sDel = parent("tableCell", this.serializeDeleted(second, deleted));

    return parent(
      "tableRow",
      [
        nameFirst ? first : sDel,
        nameFirst ? sDel : first,
        parent("tableCell", this.serializeDeleted(third, deleted)),
      ].concat(columnList.map((column) => parent("tableCell", [literal("text", columns[column] ?? "")]))),
    );
  }

  serializeNotes(notes: RootContent[], srcNotes: PMO.Member["notes"], data: { counter: number }) {
    const serialized: PhrasingContent[] = [];

    for (const note of srcNotes) {
      const superscript = typeof note === "number" ? note.toString() : data.counter.toString();

      serialized.push(
        literal("text", " "),
        parent("superscript", [literal("text", superscript)], { data: { hName: "sup" } }),
      );

      if (typeof note === "number") continue;

      notes.push(
        parent("paragraph", [
          parent("superscript", [literal("text", superscript)], { data: { hName: "sup" } }),
          literal("text", ` ${note}`),
        ]),
      );

      data.counter++;
    }

    return serialized;
  }

  serializeStructure(structure: PMO.Structure): RootContent[] {
    const notes: RootContent[] = [];

    // TODO: make this serialize additional columns
    const rows = this.serializeStrucutureFields(structure.properties, notes, structure.columns);

    return this.serializeGeneric(
      `${structure.name}Structure`,
      structure.description ?? "",
      ["Field", "Type", "Description"].concat(structure.columns),
      rows,
      notes,
    );
  }

  serializeStrucutureFields(
    properties: PMO.Property[],
    notes: RootContent[],
    columns: PMO.Base["columns"],
  ): TableRow[] {
    const rows: TableRow[] = [];

    const notesData = { counter: 1 };

    for (const property of properties) {
      const nameNode = literal("text", property.name);
      const nameSuffix = this.serializeNotes(notes, property.notes, notesData);

      if (property.optional) {
        nameNode.value += "?";
      }

      if (property.deprecated) {
        nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
      }

      const typeNode = this.serializeType(property.type);
      const descriptionNode = [literal("text", property.description ?? "")];

      rows.push(
        this.serializeGenericRow(
          true,
          `${property.name}${property.optional ? "" : "?"}`,
          nameSuffix,
          typeNode,
          descriptionNode,
          columns,
          property.columns,
          property.deleted,
        ),
      );
    }

    return rows;
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
    const notes: RootContent[] = [];

    const rows = this.serializeEnumVariants(enumeration.variants, notes, enumeration.columns);

    return this.serializeGeneric(
      enumeration.name,
      enumeration.description ?? "",
      ["Value", "Name", "Description"].concat(enumeration.columns),
      rows,
      notes,
    );
  }

  serializeEnumVariants(variants: PMO.Variant[], notes: RootContent[], columns: PMO.Base["columns"]): TableRow[] {
    const rows: TableRow[] = [];

    const notesData = { counter: 1 };

    for (const variant of variants) {
      const nameSuffix = this.serializeNotes(notes, variant.notes, notesData);

      if (variant.deprecated) {
        nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
      }

      const valueNode = [literal("text", variant.value.toString())];
      const descriptionNode = [literal("text", variant.description ?? "")];

      rows.push(
        this.serializeGenericRow(
          false,
          variant.name,
          nameSuffix,
          valueNode,
          descriptionNode,
          columns,
          variant.columns,
          variant.deleted,
        ),
      );
    }

    return rows;
  }

  serializeFlags(flags: PMO.Flags): RootContent[] {
    const notes: RootContent[] = [];
    const rows = this.serializeFlagsFlags(flags.flags, notes, flags.columns);

    return this.serializeGeneric(flags.name, flags.description ?? "", ["Value", "Name", "Description"], rows, notes);
  }

  serializeFlagsFlags(flags: PMO.Flag[], notes: RootContent[], columns: PMO.Base["columns"]): TableRow[] {
    const rows: TableRow[] = [];

    const notesData = { counter: 1 };

    for (const flag of flags) {
      const nameSuffix = this.serializeNotes(notes, flag.notes, notesData);

      if (flag.deprecated) {
        nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
      }

      const valueNode = [literal("text", `${flag.initial} << ${flag.shift}`)];
      const descriptionNode = [literal("text", flag.description ?? "")];

      rows.push(
        this.serializeGenericRow(
          false,
          flag.name,
          nameSuffix,
          valueNode,
          descriptionNode,
          columns,
          flag.columns,
          flag.deleted,
        ),
      );
    }

    return rows;
  }

  serializeDeleted(content: PhrasingContent[], deleted: boolean): PhrasingContent[] {
    if (!deleted) return content;

    return [parent("delete", content)];
  }
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
