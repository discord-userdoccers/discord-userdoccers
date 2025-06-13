import { Literal, Parent, PhrasingContent, RootContent, TableCell, TableRow } from "mdast";
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
    name: string,
    description: string,
    columns: PMO.Base["columns"],
    members: M[],
    rowSerializer: (member: M, notes: NotesData, columns: PMO.Base["columns"]) => TableRow,
  ): RootContent[] {
    const notes: RootContent[] = [];

    const prelude: RootContent[] = [
      parent("heading", [literal("text", name.replace(/(?<!^)[A-Z]/, " $&"))], { depth: 6 }),
      parent("paragraph", [literal("text", description)]),
    ];

    const table = parent("table", [
      parent(
        "tableRow",
        columns.map((column) => parent("tableCell", [literal("text", column)])),
      ),
      ...members.map((member) => rowSerializer(member, { notes, counter: 1 }, columns)),
    ]);

    return prelude.concat(table).concat(notes);
  }

  serializeGenericRow(
    columnList: string[],
    columns: Record<string, string | PhrasingContent[]>,
    deleted: boolean,
  ): TableRow {
    const cells: TableCell[] = [];

    for (const column of columnList) {
      const value = columns[column];

      if (typeof value === "string") {
        cells.push(parent("tableCell", this.serializeDeleted([literal("text", value)], deleted)));

        continue;
      }

      if (value == null) {
        cells.push(parent("tableCell", []));

        continue;
      }

      cells.push(parent("tableCell", value[0].type === "delete" ? value : this.serializeDeleted(value, deleted)));
    }

    return parent("tableRow", cells);
  }

  serializeDeletedName(name: string, suffix: PhrasingContent[], deleted: boolean): PhrasingContent[] {
    return this.serializeDeleted([literal("text", name)], deleted).concat(suffix);
  }

  serializeNotes(data: NotesData, srcNotes: PMO.Member["notes"]): PhrasingContent[] {
    const serialized: PhrasingContent[] = [];

    for (const note of srcNotes) {
      const superscript = typeof note === "number" ? note.toString() : data.counter.toString();

      serialized.push(
        literal("text", " "),
        parent("superscript", [literal("text", superscript)], { data: { hName: "sup" } }),
      );

      if (typeof note === "number") continue;

      data.notes.push(
        parent("paragraph", [
          parent("superscript", [literal("text", superscript)], { data: { hName: "sup" } }),
          literal("text", ` ${note}`),
        ]),
      );

      data.counter++;
    }

    return serialized;
  }

  serializeNameSuffix(
    notes: NotesData,
    srcNotes: PMO.Member["notes"],
    deprecated: PMO.Member["deprecated"],
  ): PhrasingContent[] {
    const nameSuffix = this.serializeNotes(notes, srcNotes);

    // TODO: handle string case
    if (deprecated) {
      nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
    }

    return nameSuffix;
  }

  serializeStructure(structure: PMO.Structure): RootContent[] {
    return this.serializeGeneric(
      `${structure.name}Structure`,
      structure.description ?? "",
      ["Field", "Type", "Description"].concat(structure.columns),
      structure.properties,
      this.serializeStrucutureProperty.bind(this),
    );
  }

  serializeStrucutureProperty(property: PMO.Property, notes: NotesData, columns: PMO.Base["columns"]): TableRow {
    const name = `${property.name}${property.optional ? "" : "?"}`;
    const nameSuffix = this.serializeNameSuffix(notes, property.notes, property.deprecated);

    const nameNode = this.serializeDeletedName(name, nameSuffix, property.deleted);
    const typeNode = this.serializeType(property.type);
    const descriptionNode = [literal("text", property.description ?? "")];

    return this.serializeGenericRow(
      columns,
      {
        Field: nameNode,
        Type: typeNode,
        Description: descriptionNode,
        ...property.columns,
      },
      property.deleted,
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

  serializeEnumVariant(variant: PMO.Variant, notes: NotesData, columns: PMO.Base["columns"]): TableRow {
    const nameSuffix = this.serializeNameSuffix(notes, variant.notes, variant.deprecated);

    const valueNode = [literal("text", variant.value.toString())];
    const nameNode = this.serializeDeletedName(variant.name, nameSuffix, variant.deleted);
    const descriptionNode = [literal("text", variant.description ?? "")];

    return this.serializeGenericRow(
      columns,
      {
        Value: valueNode,
        Name: nameNode,
        Description: descriptionNode,
        ...variant.columns,
      },
      variant.deleted,
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

  serializeFlagsFlag(flag: PMO.Flag, notes: NotesData, columns: PMO.Base["columns"]): TableRow {
    const nameSuffix = this.serializeNameSuffix(notes, flag.notes, flag.deprecated);

    const valueNode = [literal("text", `${flag.initial} << ${flag.shift}`)];
    const nameNode = this.serializeDeletedName(flag.name, nameSuffix, flag.deleted);
    const descriptionNode = [literal("text", flag.description ?? "")];

    return this.serializeGenericRow(
      columns,
      {
        Value: valueNode,
        Name: nameNode,
        Description: descriptionNode,
        ...flag.columns,
      },
      flag.deleted,
    );
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
