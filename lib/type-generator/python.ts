import { TableType, Tokenizer, TypeInfo } from "./tokenizer";

const TYPE_MAP: [string | RegExp, string][] = [
  ["string", "str"],
  ["boolean", "bool"],
  ["snowflake", "Snowflake"],
  ["ISO8601 timestamp", "str"],
  ["file contents", "bytes"],
  [/^binary data/i, "bytes"],
  // Handles most numeric types.
  [/^(signed|unsigned)?\s?(byte|short|integer)/i, "int"],
];

export class PythonGenerator {
  public readonly tokenizer: Tokenizer;

  public constructor(rootElement: HTMLTableElement) {
    this.tokenizer = new Tokenizer(rootElement);
  }

  public generateCode(): string {
    const layout = this.tokenizer.getLayout();
    if (!layout) throw new Error("Invalid layout received.");

    const title = this.typeToString(layout.title);
    const description = layout.description?.multiline ?? [];

    const properties = [];

    for (const property of layout.contents) {
      const isEnum = layout.type === TableType.Enum;
      let field = this.typeToString(property.field, !isEnum);
      const isUndefinable = field.endsWith("?");
      if (isUndefinable) field = this.stripQuestionMark(field);

      const isDeprecated = this.typeToString(property.field).includes("(deprecated)");

      let type = this.typeToString(property.type, isEnum);
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
        isUndefinable,
      });
    }

    let output = "";

    if (description.length) {
      output += `"""\n`;
      description.forEach((line, i) => {
        output += `${line}\n`;
        if (i < description.length - 1) output += `\n`;
      });
      output += `"""\n`;
    }

    if (layout.type === TableType.Struct) {
      output += `class ${title}(TypedDict):\n`;
    } else if (layout.type === TableType.Enum || layout.type === TableType.Event) {
      output += `class ${title}(Enum):\n`;
    } else {
      // TODO: Should I Object.freeze()?
      output += `class ${title}(Flag):\n`;
    }

    for (const property of properties) {
      // if desc + other columns, use a multiline string.
      if (property.otherColumns.length) {
        output += `\t"""\n`;
        output += `\t${property.description}\n`;
        for (const [key, value] of property.otherColumns) {
          output += `\t${key}: ${value}\n`;
        }
        output += `\t"""\n`;
      } else if (property.description) {
        output += `\t#: ${property.description}\n`;
      } else if (property.otherColumns.length > 1) {
        output += `\t"""\n`;
        for (const [key, value] of property.otherColumns) {
          output += `\t${key}: ${value}\n`;
        }
        output += `\t"""\n`;
      } else if (property.otherColumns.length) {
        const [key, value] = property.otherColumns[0];
        output += `\t#: ${key}: ${value}\n`;
      }

      if (layout.type === TableType.Struct) {
        const type = property.isUndefinable ? `NotRequired[${property.type}]` : property.type;
        output += `\t${property.field}: ${type}\n`;
      } else if (layout.type === TableType.Enum || layout.type === TableType.Event) {
        output += `\t${property.field} = ${property.type}\n`;
      } else {
        output += `\t${property.field} = ${property.type}\n`;
      }
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

  private stripQuestionMark(input: string): string {
    if (input.startsWith("?")) {
      input = input.slice(1);
    }
    if (input.endsWith("?")) {
      input = input.slice(0, -1);
    }
    return input;
  }

  private typeToString(type: TypeInfo, onlyFirstWord = false): string {
    if (type.array) {
      if (type.array.length === 1) {
        // arrays in userdoccers are defined as array[T]
        const inner = this.typeToString(type.array[0]);
        return `list[${inner}]`;
      } else if (type.array.length > 1) {
        // tuples in userdoccers are defined as array[T1, T2, ...]
        const inner = type.array
          .map((i) => this.typeToString(i))
          .map((i) => this.typeMapper(i))
          .join(", ");
        return `tuple[${inner}]`;
      }
    }
    if (type.map) {
      const left = this.typeToString(type.map[0]);
      const right = this.typeToString(type.map[1]);
      return `dict[${this.typeMapper(left)}, ${this.typeMapper(right)}]`;
    }
    if (type.multiline) {
      return type.multiline.join("\n");
    }
    if (type.type && type.optional) {
      return `${this.typeMapper(type.type)} | None`;
    }
    if (type.type && onlyFirstWord) {
      return type.type.split(" ")[0];
    }
    if (type.type) {
      return type.type;
    }
    throw new Error("Invalid TypeInfo provided.");
  }
}
