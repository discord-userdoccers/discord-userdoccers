import { TableType, Tokenizer, TypeInfo } from "./tokenizer";

const TYPE_MAP: [string | RegExp, string][] = [
  ["string", "String"],
  ["str", "String"],
  ["boolean", "bool"],
  ["snowflake", "Snowflake"],
  ["ISO8601 timestamp", "Timestamp"],
  ["ISO8601 date", "Timestamp"],
  ["file contents", "Vec<u8>"],
  [/^binary data/i, "Vec<u8>"],
  // i64 just to be safe
  [/^(signed|unsigned)?\s?(byte|short|integer)/i, "i64"],
];

export class RustGenerator {
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
      let field = this.typeToString(property.field, !isEnum);
      const isDeprecated = this.typeToString(property.field).includes("(deprecated)");
      const isUndefinable = field.endsWith("?");
      if (isUndefinable) field = this.stripQuestionMark(field);

      if (property.type?.type && !isEnum) {
        property.type = new TypeInfo([this.typeMapper(property.type.type)]);
      }
      const onlyFirstWord = isEnum && layout.type !== TableType.Bitfield;
      let type = property.type && this.typeToString(property.type, onlyFirstWord);
      if (!isEnum) type = type && this.typeMapper(type);

      const description = property.description ? this.typeToString(property.description) : "";

      // cant use keywords for field names in rust
      // these two keywords are the only ones ive seen used in the docs
      if (field === "type" || field === "unsafe") field = `r#${field}`;

      properties.push({
        field,
        type,
        description,
        isDeprecated,
        isUndefinable,
      });
    }

    let output = "";

    if (description.length) {
      output += "///\n";
      description.forEach((line) => {
        output += `/// ${line}\n`;
      });
    }

    if (layout.type === TableType.Struct) {
      output += `pub struct ${title} {\n`;
    } else {
      output += `pub enum ${title} {\n`;
    }

    for (const property of properties) {
      if (property.description) output += `\t/// ${property.description}\n`;
      if (property.isDeprecated) output += `\t#[deprecated]\n`;

      if (layout.type === TableType.Struct) {
        if (property.isUndefinable) output += `\t#[serde(skip_serializing_if = "Option::is_none")]\n`;
        output += `\tpub ${property.field}: ${property.type},\n`;
      } else if (layout.type === TableType.Enum || layout.type === TableType.Event) {
        if (property.type) {
          output += `\t${property.field} = ${property.type},\n`;
        } else {
          output += `\t${property.field},\n`;
        }
      } else {
        output += `\t${property.field} = ${property.type},\n`;
      }
    }
    return output;
  }

  private typeMapper(input: string): string {
    for (const [k, v] of TYPE_MAP) {
      if (k instanceof RegExp) {
        if (input.match(k)) return v;
      }
      if (input === k) return v;
    }
    return input;
  }

  private typeToString(type: TypeInfo, onlyFirstWord = false, isUndefinable = false): string {
    let stringType: string = "";

    if (type.array) {
      if (type.array.length === 1) {
        const inner = this.typeMapper(this.typeToString(type.array[0], onlyFirstWord));
        stringType = `Vec<${inner}>`;
      } else if (type.array.length > 1) {
        const inner = type.array
          .map((i) => this.typeToString(i, onlyFirstWord))
          .map((i) => this.typeMapper(i))
          .join(", ");
        stringType = `(${inner})`;
      }
    } else if (type.map) {
      const left = this.typeMapper(this.typeToString(type.map[0], onlyFirstWord));
      const right = this.typeMapper(this.typeToString(type.map[1], onlyFirstWord));
      stringType = `HashMap<${left}, ${right}>`;
    } else if (type.multiline) {
      stringType = type.multiline.join("\n");
    } else if (type.type) {
      const mappedType = this.typeMapper(type.type);
      stringType = onlyFirstWord ? mappedType.split(" ")[0] : mappedType;
    } else {
      throw new Error("Invalid TypeInfo provided.");
    }

    if (type.optional || (isUndefinable && !stringType.startsWith("Option<"))) {
      stringType = `Option<${stringType}>`;
    }

    return stringType;
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
}
