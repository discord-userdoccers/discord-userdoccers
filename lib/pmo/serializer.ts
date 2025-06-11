import { Literal, Parent, PhrasingContent, RootContent, TableRow } from "mdast";
import { PMO } from "./types";

type ParentNodes = {
  [N in RootContent as N["type"]]: N extends Parent ? N : never;
};

type LiteralNodes = {
  [N in RootContent as N["type"]]: N extends Literal ? N : never;
};

type Filter<T> = {
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

  serializeStructure(structure: PMO.Structure): RootContent[] {
    const notes: RootContent[] = [];

    const prelude: RootContent[] = [
      parent("heading", [literal("text", `${structure.name} Structure`)], { depth: 6 }),
      parent("paragraph", [literal("text", structure.description ?? "")]),
    ];

    const table = parent("table", [
      parent("tableRow", [
        parent("tableCell", [literal("text", "Field")]),
        parent("tableCell", [literal("text", "Type")]),
        parent("tableCell", [literal("text", "Description")]),
      ]),
      ...this.serializeStrucutureFields(structure.properties, notes),
    ]);

    return prelude.concat(table).concat(...notes);
  }

  serializeStrucutureFields(properties: PMO.Property[], notes: RootContent[]): TableRow[] {
    const rows: TableRow[] = [];

    let notesCounter = 1;

    for (const property of properties) {
      const nameNode = literal("text", property.name);
      const nameSuffix: PhrasingContent[] = [];

      if (property.optional) {
        nameNode.value += "?";
      }

      for (const note of property.notes) {
        const superscript = typeof note === "number" ? note.toString() : notesCounter.toString();

        nameSuffix.push(
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

        notesCounter++;
      }

      if (property.deprecated) {
        nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
      }

      const typeNode = this.serializeType(property.type);

      const descriptionNode = [literal("text", property.description ?? "")];

      rows.push(
        parent("tableRow", [
          parent("tableCell", this.serializeDeleted([nameNode], property.deleted).concat(nameSuffix)),
          parent("tableCell", this.serializeDeleted(typeNode, property.deleted)),
          parent("tableCell", this.serializeDeleted(descriptionNode, property.deleted)),
        ]),
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

  // eslint-disable-next-line
  serializeEnum(enumeration: PMO.Enum): RootContent[] {
    const notes: RootContent[] = [];

    const prelude: RootContent[] = [
      parent("heading", [literal("text", `${enumeration.name.slice(0, -4)} Type`)], { depth: 6 }),
      parent("paragraph", [literal("text", enumeration.description ?? "")]),
    ];

    const allString = !enumeration.variants.some((variant) => typeof variant.value === "number");

    const table = parent("table", [
      parent("tableRow", [
        parent("tableCell", [literal("text", "Value")]),
        ...(allString ? [] : [parent("tableCell", [literal("text", "Name")])]),
        parent("tableCell", [literal("text", "Description")]),
      ]),
      ...this.serializeEnumVariants(enumeration.variants, notes, allString),
    ]);

    return prelude.concat(table).concat(...notes);
  }

  serializeEnumVariants(variants: PMO.Variant[], notes: RootContent[], allString: boolean): TableRow[] {
    const rows: TableRow[] = [];

    let notesCounter = 1;

    for (const variant of variants) {
      const nameNode = literal("text", variant.name);
      const nameSuffix: PhrasingContent[] = [];

      for (const note of variant.notes) {
        const superscript = typeof note === "number" ? note.toString() : notesCounter.toString();

        nameSuffix.push(
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

        notesCounter++;
      }

      if (variant.deprecated) {
        nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
      }

      const valueNode = literal("text", variant.value.toString());

      const descriptionNode = [literal("text", variant.description ?? "")];

      rows.push(
        parent("tableRow", [
          parent("tableCell", this.serializeDeleted([valueNode], variant.deleted)),
          ...(allString
            ? []
            : [parent("tableCell", this.serializeDeleted([nameNode], variant.deleted).concat(nameSuffix))]),
          parent("tableCell", this.serializeDeleted(descriptionNode, variant.deleted)),
        ]),
      );
    }

    return rows;
  }

  // eslint-disable-next-line
  serializeFlags(flags: PMO.Flags): RootContent[] {
    const notes: RootContent[] = [];

    const prelude: RootContent[] = [
      parent("heading", [literal("text", `${flags.name.slice(0, -5)} Flags`)], { depth: 6 }),
      parent("paragraph", [literal("text", flags.description ?? "")]),
    ];

    const table = parent("table", [
      parent("tableRow", [
        parent("tableCell", [literal("text", "Value")]),
        parent("tableCell", [literal("text", "Name")]),
        parent("tableCell", [literal("text", "Description")]),
      ]),
      ...this.serializeFlagsFlags(flags.flags, notes),
    ]);

    return prelude.concat(table).concat(...notes);
  }

  serializeFlagsFlags(flags: PMO.Flag[], notes: RootContent[]): TableRow[] {
    const rows: TableRow[] = [];

    let notesCounter = 1;

    for (const flag of flags) {
      const nameNode = literal("text", flag.name);
      const nameSuffix: PhrasingContent[] = [];

      for (const note of flag.notes) {
        const superscript = typeof note === "number" ? note.toString() : notesCounter.toString();

        nameSuffix.push(
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

        notesCounter++;
      }

      if (flag.deprecated) {
        nameSuffix.push(parent("strong", [literal("text", " (deprecated)")]));
      }

      const valueNode = literal("text", `${flag.initial} << ${flag.shift}`);

      const descriptionNode = [literal("text", flag.description ?? "")];

      rows.push(
        parent("tableRow", [
          parent("tableCell", this.serializeDeleted([valueNode], flag.deleted)),
          parent("tableCell", this.serializeDeleted([nameNode], flag.deleted).concat(nameSuffix)),
          parent("tableCell", this.serializeDeleted(descriptionNode, flag.deleted)),
        ]),
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
