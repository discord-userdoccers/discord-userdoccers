import { Delete, PhrasingContent, RootContent, TableRow, Text } from "mdast";
import { PMO } from "./types";

export class Serializer {
  serialize(model: PMO.Structure | PMO.Enum | PMO.Flags) {
    switch (model.type) {
      case "structure":
        return this.serializeStructure(model);
      case "enum":
        return this.serializeEnum(model);
      case "flags":
        return this.serializeFlags(model);
    }
  }

  serializeStructure(structure: PMO.Structure) {
    const notes: RootContent[] = [];

    const prelude: RootContent[] = [
      {
        type: "heading",
        depth: 6,
        children: [
          {
            type: "text",
            value: `${structure.name} Structure`,
          },
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            // TODO: parse as markdown
            value: structure.description ?? "",
          },
        ],
      },
    ];

    const table: RootContent = {
      type: "table",
      children: [
        {
          type: "tableRow",
          children: [
            {
              type: "tableCell",
              children: [{ type: "text", value: "Field" }],
            },
            {
              type: "tableCell",
              children: [{ type: "text", value: "Type" }],
            },
            {
              type: "tableCell",
              children: [{ type: "text", value: "Description" }],
            },
          ],
        },
        ...this.serializeStrucutureFields(structure.properties, notes),
      ],
    };

    return prelude.concat(table).concat(...notes);
  }

  serializeStrucutureFields(properties: PMO.Property[], notes: RootContent[]) {
    // TODO: convert to table rows
    const rows: TableRow[] = [];

    let notesCounter = 1;

    for (const property of properties) {
      const nameNode: PhrasingContent[] = [{ type: "text", value: property.name }];

      if (property.optional) {
        (nameNode[0] as Text).value += "?";
      }

      for (const note of property.notes) {
        const superscript = typeof note === "number" ? note.toString() : notesCounter.toString();

        nameNode.push({
          type: "text",
          value: " ",
        });

        nameNode.push({
          type: "superscript",
          data: {
            hName: "sup",
          },
          children: [
            {
              type: "text",
              value: superscript,
            },
          ],
        });

        if (typeof note === "number") continue;

        notes.push({
          type: "paragraph",
          children: [
            {
              type: "superscript",
              data: {
                hName: "sup",
              },
              children: [
                {
                  type: "text",
                  value: superscript,
                },
              ],
            },
            {
              type: "text",
              // TODO: parse as markdown
              value: ` ${note}`,
            },
          ],
        });

        notesCounter++;
      }

      if (property.deprecated) {
        nameNode.push({
          type: "strong",
          children: [
            {
              type: "text",
              value: " (deprecated)",
            },
          ],
        });
      }

      const typeNode: PhrasingContent[] = this.serializeType(property.type);

      const descriptionNode: PhrasingContent[] = [
        {
          type: "text",
          // TODO: parse as markdown
          value: property.description ?? "",
        },
      ];

      rows.push({
        type: "tableRow",
        children: [
          {
            type: "tableCell",
            children: this.serializeDeleted(nameNode, property.deleted),
          },
          {
            type: "tableCell",
            children: typeNode,
          },
          {
            type: "tableCell",
            children: this.serializeDeleted(descriptionNode, property.deleted),
          },
        ],
      });
    }

    return rows;
  }

  serializeType(type: PMO.Types.Any): PhrasingContent[] {
    switch (type.type) {
      case "snowflake":
        return [{ type: "text", value: "snowflake" }];
      case "map":
        return [
          { type: "text", value: "map[" },
          ...this.serializeType(type.key),
          { type: "text", value: ", " },
          ...this.serializeType(type.value),
          { type: "text", value: "]" },
        ];
      case "date":
        return [{ type: "text", value: "ISO8601 Date" }];
      case "primitive":
        return [{ type: "text", value: type.kind }];
      case "union":
        return type.elements.flatMap((t, index) => {
          const serialized = this.serializeType(t);

          if (index != type.elements.length - 1) {
            serialized.push({
              type: "text",
              value: " | ",
            });
          }

          return serialized;
        });
      case "array":
        return [{ type: "text", value: "array[" }, ...this.serializeType(type.element), { type: "text", value: "]" }];
      case "tuple":
        return [
          { type: "text", value: "[" },
          ...type.elements.flatMap((t, index) => {
            const serialized = this.serializeType(t);

            if (index != type.elements.length - 1) {
              serialized.push({
                type: "text",
                value: ", ",
              });
            }

            return serialized;
          }),
          { type: "text", value: "]" },
        ];
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
        }, "/");

        const last = type.path.at(-1)!;
        const trailer: PhrasingContent[] = anchor.endsWith("-structure") ? [{ type: "text", value: " object" }] : [];

        return [
          {
            type: "link",
            url: anchor,
            children: [
              {
                type: "text",
                value: last,
              },
            ],
          },
          ...trailer,
        ];
    }
  }

  // eslint-disable-next-line
  serializeEnum(enumeration: PMO.Enum) {
    return [];
  }

  // eslint-disable-next-line
  serializeFlags(flags: PMO.Flags) {
    return [];
  }

  serializeDeleted(content: PhrasingContent[], deleted: boolean) {
    if (!deleted) return content;

    return [
      {
        type: "delete",
        children: [content[0]],
      } satisfies Delete,
      ...content.slice(1),
    ];
  }
}
