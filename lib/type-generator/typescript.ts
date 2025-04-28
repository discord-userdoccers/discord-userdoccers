import { TableType, Tokenizer, TypeInfo } from "./tokenizer";

const TYPE_MAP: [string | RegExp, string][] = [
  ["snowflake", "Snowflake"],
  ["ISO8601 timestamp", "string"],
  ["file contents", "UInt8Array"],
  [/^binary data/i, "Uint8Array"],
  // Handles most numeric types.
  [/^(signed|unsigned)?\s?(byte|short|integer)/i, "number"],
];

export class TypescriptGenerator {
  public readonly tokenizer: Tokenizer;

  public constructor(rootElement: HTMLTableElement) {
    this.tokenizer = new Tokenizer(rootElement);
  }

  public generateCode() {
    const layout = this.tokenizer.getLayout();
    if (!layout) throw new Error("Invalid layout received.");

    const title = this.typeToString(layout.title);
    const description = layout.description?.multiline ?? [];

    const properties = [];

    for (const property of layout.contents) {
      const isEnum = layout.type === TableType.Enum;
      const field = this.typeToString(property.field, !isEnum);

      const isDeprecated = this.typeToString(property.field).includes("(deprecated)");

      if (property.type.type && !isEnum) {
        property.type = new TypeInfo([this.typeMapper(property.type.type)]);
      }
      let type = this.typeToString(property.type, !isEnum);
      if (!isEnum) type = this.typeMapper(type);

      const description = property.description ? this.typeToString(property.description) : "";

      const otherColumns = [];
      for (const column of property.otherColumns) {
        otherColumns.push([this.typeToString(column[0]), this.typeToString(column[1])]);
      }

      properties.push({
        field,
        type,
        description,
        otherColumns,
        isDeprecated,
      });
    }

    let output = "";

    if (description.length) {
      output += "/**\n";
      description.forEach((line, i) => {
        output += ` * ${line}\n`;
        if (i < description.length - 1) output += ` *\n`;
      });
      output += " */\n";
    }

    if (layout.type === TableType.Struct) {
      output += `export interface ${title} {\n`;
    } else if (layout.type === TableType.Enum || layout.type === TableType.Event) {
      output += `export enum ${title} {\n`;
    } else {
      // TODO: Should I Object.freeze()?
      output += `const ${title} = {\n`;
    }

    for (const property of properties) {
      if (property.description || property.otherColumns.length) {
        output += `\t/**\n`;

        if (property.description) output += `\t * ${property.description}\n`;
        if (property.description && property.otherColumns.length) {
          output += `\t *\n`; // add an extra newline for spacing.
        }
        for (const [key, value] of property.otherColumns) {
          output += `\t * ${key}: ${value}\n`;
        }
        if (property.isDeprecated) {
          output += `\t * @deprecated\n`;
        }
        output += `\t */\n`;
      }

      if (layout.type === TableType.Struct) {
        output += `\t${property.field}: ${property.type};\n`;
      } else if (layout.type === TableType.Enum || layout.type === TableType.Event) {
        output += `\t${property.field} = ${property.type},\n`;
      } else {
        const [left, right] = property.type.split("<<").map((s) => s.trim());
        output += `\t${property.field}: ${left}n << ${right}n,\n`;
      }
    }

    if (layout.type === TableType.Struct || layout.type === TableType.Enum || layout.type === TableType.Event) {
      output += `}\n`;
    } else {
      output += `} as const;\n`;
    }

    output += "\n";

    return output;
  }

  private typeMapper(input: string): string {
    for (const [k, v] of TYPE_MAP) {
      if (k instanceof RegExp) {
        if (input.match(k)) {
          return v;
        }
      }
      if (input === k) {
        return v;
      }
    }
    return input;
  }

  private typeToString(type: TypeInfo, onlyFirstWord = false, isInArray = false): string {
    if (type.array) {
      if (type.array.length === 1) {
        // arrays in userdoccers are defined as array[T]
        const inner = this.typeToString(type.array[0], onlyFirstWord, true);
        return `${inner}[]`;
      } else if (type.array.length > 1) {
        // tuples in userdoccers are defined as array[T1, T2, ...]
        const inner = type.array
          .map((i) => this.typeToString(i, onlyFirstWord, true))
          .map((i) => this.typeMapper(i))
          .join(", ");
        return `[${inner}]`;
      }
    }
    if (type.map) {
      const left = this.typeToString(type.map[0]);
      const right = this.typeToString(type.map[1]);
      return `Record<${this.typeMapper(left)}, ${this.typeMapper(right)}>`;
    }
    if (type.multiline) {
      return type.multiline.join("\n");
    }
    if (type.type && type.optional) {
      const t = this.typeMapper(type.type);
      if (isInArray) {
        return `(${t} | null)`;
      }
      return `${t} | null`;
    }
    if (type.type && onlyFirstWord) {
      return type.type.split(" ")[0];
    }
    if (typeof type.type === "string") {
      return type.type;
    }

    throw new Error("Invalid TypeInfo provided.");
  }
}
