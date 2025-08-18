import { TableType, Tokenizer, TypeInfo } from "./tokenizer";

const TYPE_MAP: [string | RegExp, string][] = [
    ["boolean", "bool"],
    ["snowflake", "Snowflake"],
    ["ISO8601 timestamp", "time.Time"],
    ["ISO8601 date", "time.Time"],
    ["file contents", "[]byte"],
    [/^binary data/i, "[]byte"],
    // i64 just to be safe
    [/^(signed|unsigned)?\s?(byte|short|integer)/i, "int64"],
];

export class GoGenerator {
    public readonly tokenizer: Tokenizer;

    public constructor(rootElement: HTMLTableElement) {
        this.tokenizer = new Tokenizer(rootElement);
    }

    public generateCode(): string {
        const layout = this.tokenizer.getLayout();
        if (!layout) throw new Error("Invalid layout received.");

        const title = this.typeToString(layout.title);
        const description = layout.description?.multiline ?? [];

        type Property = {
            field: string;
            jsonKey: string;
            type?: string;
            description: string;
            otherColumns: [string, string][];
            isDeprecated: boolean;
            isUndefinable: boolean;
            isOptionalType: boolean;
        };

        const properties: Property[] = [];

        for (const property of layout.contents) {
            const isEnum = layout.type === TableType.Enum;

            let rawField = this.typeToString(property.field, true);
            const isDeprecated = this.typeToString(property.field).includes("(deprecated)");
            const isUndefinable = rawField.endsWith("?");
            if (isUndefinable) rawField = this.stripQuestionMark(rawField);

            const jsonKey = rawField;
            const field = this.toExportedName(rawField);

            if (property.type?.type) {
                property.type = new TypeInfo([this.typeMapper(`${property.type.optional ? "?" : ""}${property.type.type}`)]);
            }

            const onlyFirstWord = isEnum && layout.type !== TableType.Bitfield;
            let mappedType = property.type && this.typeToString(property.type, onlyFirstWord);
            if (!isEnum) mappedType = mappedType && this.typeMapper(mappedType);

            const description = property.description ? this.typeToString(property.description) : "";

            const otherColumns: [string, string][] = [];
            for (const column of property.otherColumns) {
                otherColumns.push([this.typeToString(column[0]), this.typeToString(column[1])]);
            }

            properties.push({
                field,
                jsonKey,
                type: mappedType,
                description,
                otherColumns,
                isDeprecated,
                isUndefinable,
                isOptionalType: Boolean(property.type?.optional),
            });
        }

        let output = "";

        if (description.length) {
            description.forEach((line) => {
                output += `// ${line}\n`;
            });
        }

        if (layout.type === TableType.Struct) {
            output += `type ${title} struct {\n`;
            for (const prop of properties) {
                const hasDoc = prop.description || prop.otherColumns.length || prop.isDeprecated;
                if (hasDoc) {
                    if (prop.isDeprecated) {
                        const depText = prop.description ? `Deprecated: ${prop.description}` : "Deprecated.";
                        output += `\t// ${depText}\n`;
                    }
                    if (prop.description && !prop.isDeprecated) {
                        output += `\t// ${prop.description}\n`;
                    }
                    for (const [key, value] of prop.otherColumns) {
                        output += `\t// ${key}: ${value}\n`;
                    }
                }

                const baseType = prop.type ?? "interface{}";
                const needsPointer = this.shouldPointer(baseType) && (prop.isUndefinable || prop.isOptionalType);
                const fieldType = needsPointer ? `*${baseType}` : baseType;
                const omitEmpty = (prop.isUndefinable || prop.isOptionalType) ? ",omitempty" : "";
                const jsonKey = prop.jsonKey;
                output += `\t${prop.field} ${fieldType} \`json:\"${jsonKey}${omitEmpty}\"\`\n`;
            }
            output += `}\n`;
        } else if (layout.type === TableType.Bitfield) {
            output += `type ${title} uint64\n`;
            output += `const (\n`;
            for (const prop of properties) {
                if (prop.description) output += `\t// ${prop.description}\n`;
                if (prop.isDeprecated) output += `\t// Deprecated.\n`;
                output += `\t${title}${this.toExportedName(prop.jsonKey)} ${title} = ${prop.type}\n`;
            }
            output += `)\n`;
        } else if (layout.type === TableType.Enum || layout.type === TableType.Event) {
            // Decide underlying type. Default to int; explicit values will be assigned directly.
            output += `type ${title} int\n`;
            output += `const (\n`;
            let useIota = properties.every((p) => !p.type);
            let iotaIndex = 0;
            for (const prop of properties) {
                if (prop.description) output += `\t// ${prop.description}\n`;
                if (prop.isDeprecated) output += `\t// Deprecated.\n`;
                const constName = `${title}${this.toExportedName(prop.jsonKey)}`;
                if (useIota) {
                    if (iotaIndex === 0) {
                        output += `\t${constName} ${title} = iota\n`;
                    } else {
                        output += `\t${constName}\n`;
                    }
                    iotaIndex++;
                } else {
                    const value = prop.type ?? `${iotaIndex}`;
                    output += `\t${constName} ${title} = ${value}\n`;
                    iotaIndex++;
                }
            }
            output += `)\n`;
        }

        output += "\n";

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

    private typeToString(type: TypeInfo, onlyFirstWord = false): string {
        if (type.array) {
            if (type.array.length === 1) {
                const inner = this.typeMapper(this.typeToString(type.array[0], onlyFirstWord));
                return `[]${inner}`;
            } else if (type.array.length > 1) {
                return `[]any`;
            }
        }
        if (type.map) {
            const left = this.typeMapper(this.typeToString(type.map[0], onlyFirstWord));
            const right = this.typeMapper(this.typeToString(type.map[1], onlyFirstWord));
            return `map[${left}]${right}`;
        }
        if (type.multiline) {
            return type.multiline.join("\n");
        }
        if (type.type) {
            const mapped = this.typeMapper(type.type);
            return onlyFirstWord ? mapped.split(" ")[0] : mapped;
        }
        throw new Error("Invalid TypeInfo provided.");
    }

    private stripQuestionMark(input: string): string {
        if (input.startsWith("?")) input = input.slice(1);
        if (input.endsWith("?")) input = input.slice(0, -1);
        return input;
    }

    private toExportedName(input: string): string {
        const cleaned = this.stripQuestionMark(input);
        const parts = cleaned
            .replace(/[^a-zA-Z0-9]+/g, " ")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        const pascal = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
        return pascal.length ? pascal : "Field";
    }

    private shouldPointer(baseType: string): boolean {
        if (baseType.startsWith("[]")) return false;
        if (baseType.startsWith("map[")) return false;
        return true;
    }
}