import { BitfieldData, EnumData, StructData, TypeGenerator } from ".";

const trimBySpace = (val: string) => val.split(/\s/)[0];

const TYPE_MAP: Record<string, string> = {
  integer: "number",
};

function writeDocs(description: string[], otherColumns: Record<string, string> = {}): string {
  let output = "";

  if (description.length) {
    output += "\t/**\n";
    for (const line of description) {
      output += `\t * ${line}\n`;
    }

    if (Object.entries(otherColumns).length > 0) {
      output += `\t *\n`;
      for (const [k, v] of Object.entries(otherColumns)) {
        output += `\t * @property ${k} - ${v}\n`;
      }
    }

    output += "\t */\n";
  }

  return output;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nullableStr = (inner: string, isNullable: boolean, isUndefinable: boolean) => {
  if (isNullable) return `${inner} | null`;

  return inner;
};

export class TypescriptGenerator extends TypeGenerator {
  protected static override parseTypeArray(key: string | null, typeName: string): string {
    const match = /array\[(.*?)\]/.exec(typeName);

    if (match?.[1]) {
      return `${this.parseType(key, match[1], TYPE_MAP, nullableStr)}[]`;
    }

    return typeName;
  }

  protected static override parseTypeMap(key: string | null, typeName: string): string {
    const match = /map\[(.*?),(.*?)\]/.exec(typeName);

    if (match?.[2]) {
      const [keyType, valueType] = match.slice(1).map((t) => t.trim());

      const left = this.parseType(key, keyType, TYPE_MAP, nullableStr);
      const right = this.parseType(key, valueType, TYPE_MAP, nullableStr);

      return `Record<${left}, ${right}>`;
    }

    return typeName;
  }

  protected static override handleStruct(data: StructData): string {
    let output = "";

    if (data.description) {
      output += "/**\n";

      const len = data.description.length;
      data.description.forEach((line, i) => {
        output += ` * ${line}\n`;
        if (i < len - 1) {
          output += ` *\n`;
        }
      });

      output += " */\n";
    }

    output += `export interface ${data.title} {\n`;

    for (const row of data.contents) {
      output += writeDocs(row.description, row.otherColumns);
      output += `\t${trimBySpace(row.field)}: ${this.parseType(row.field.split(/\s/)[0], row.type, TYPE_MAP, nullableStr)};\n`;
    }

    output += "}\n";

    return output;
  }

  protected static override handleEnum(data: EnumData): string {
    let output = "";

    if (data.description) {
      output += "/**\n";

      const len = data.description.length;
      data.description.forEach((line, i) => {
        output += ` * ${line}\n`;
        if (i < len - 1) {
          output += ` *\n`;
        }
      });

      output += " */\n";
    }

    output += `export enum ${data.title} {\n`;

    for (const row of data.contents) {
      output += writeDocs(row.description, row.otherColumns);
      output += `\t${trimBySpace(row.name)} = ${this.parseType(row.name.split(/\s/)[0], row.value, TYPE_MAP, nullableStr)},\n`;
    }

    output += "}\n";

    return output;
  }

  protected static override handleBitfield(data: BitfieldData): string {
    let output = "";

    if (data.description) {
      output += "/**\n";

      const len = data.description.length;
      data.description.forEach((line, i) => {
        output += ` * ${line}\n`;
        if (i < len - 1) {
          output += ` *\n`;
        }
      });

      output += " */\n";
    }

    output += `const ${data.title} = {\n`;

    for (const row of data.contents) {
      output += writeDocs(row.description, row.otherColumns);

      const [left, right] = row.value.split("<<").map((x) => x.trim());

      output += `\t${trimBySpace(row.name)}: ${left}n << ${right}n,\n`;
    }

    output += "} as const;\n";

    return output;
  }
}
