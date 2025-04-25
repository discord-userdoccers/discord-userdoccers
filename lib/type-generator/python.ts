import { BitfieldData, EnumData, StructData, TypeGenerator } from ".";

const trimBySpace = (val: string) => {
  const trimmed = val.split(/\s/)[0];

  if (trimmed.endsWith("?")) {
    return trimmed.slice(0, -1);
  }

  return trimmed;
};
const TYPE_MAP: Record<string, string> = {
  integer: "int",
  string: "str",
  boolean: "bool",
};

function writeDocs(description: string[], otherColumns: Record<string, string> = {}): string {
  let output = "";

  if (description.length === 1 && Object.entries(otherColumns).length === 0) {
    output += `\t#: ${description[0]}\n`;
  } else if (description.length) {
    output += '\t"""\n';
    for (const line of description) {
      output += `\t${line}\n`;
    }

    if (Object.entries(otherColumns).length > 0) {
      output += `\t\n`;
      for (const [k, v] of Object.entries(otherColumns)) {
        output += `\t${k}: ${v}\n`;
      }
    }

    output += '\t"""\n';
  }

  return output;
}

const nullableStr = (inner: string, isUndefinable: boolean) =>
  isUndefinable ? `NotRequired[${inner}]` : `${inner} | None`;

export class PythonGenerator extends TypeGenerator {
  protected static override parseTypeArray(key: string, typeName: string): string {
    const match = /array\[(.*?)\]/.exec(typeName);

    if (match?.[1]) {
      return `list[${this.parseType(key, match[1], TYPE_MAP, nullableStr)}]`;
    }

    return typeName;
  }

  protected static override parseTypeMap(key: string, typeName: string): string {
    const match = /map\[(.*?),(.*?)\]/.exec(typeName);

    if (match?.[2]) {
      const [keyType, valueType] = match.slice(1).map((t) => t.trim());

      const left = this.parseType(key, keyType, TYPE_MAP, nullableStr);
      const right = this.parseType(key, valueType, TYPE_MAP, nullableStr);

      return `dict[${left}, ${right}]`;
    }

    return typeName;
  }

  protected static override handleStruct(data: StructData): string {
    let output = "";

    if (data.description) {
      output += '"""\n';

      const len = data.description.length;
      data.description.forEach((line, i) => {
        output += `${line}\n`;
        if (i < len - 1) {
          output += `\n`;
        }
      });

      output += '"""\n';
    }

    output += `class ${data.title}(TypedDict):\n`;

    for (const row of data.contents) {
      output += writeDocs(row.description, row.otherColumns);
      output += `\t${trimBySpace(row.field)}: ${this.parseType(row.field, row.type, TYPE_MAP, nullableStr)}\n`;
    }

    return output;
  }

  protected static override handleEnum(data: EnumData): string {
    let output = "";

    if (data.description) {
      output += '"""\n';

      const len = data.description.length;
      data.description.forEach((line, i) => {
        output += `${line}\n`;
        if (i < len - 1) {
          output += `\n`;
        }
      });

      output += '"""\n';
    }

    output += `class ${data.title}(Enum):\n`;

    for (const row of data.contents) {
      output += writeDocs(row.description, row.otherColumns);
      output += `\t${trimBySpace(row.name)} = ${this.parseType(row.name, row.value)}\n`;
    }

    return output;
  }

  protected static override handleBitfield(data: BitfieldData): string {
    let output = "";

    if (data.description) {
      output += '"""\n';

      const len = data.description.length;
      data.description.forEach((line, i) => {
        output += `${line}\n`;
        if (i < len - 1) {
          output += `\n`;
        }
      });

      output += '"""\n';
    }

    output += `class ${data.title}(Flag):\n`;

    for (const row of data.contents) {
      output += writeDocs(row.description, row.otherColumns);

      const [left, right] = row.value.split("<<").map((x) => x.trim());

      output += `\t${trimBySpace(row.name)} = ${left} << ${right}\n`;
    }

    return output;
  }
}
