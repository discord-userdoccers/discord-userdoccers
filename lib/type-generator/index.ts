/**
 * @file Generate types from Markdown tables
 * @author Megumin <megumin@megu.dev>
 * Made with love.
 */

export enum TableType {
  Struct,
  Enum,
  Bitfield,
}

export interface StructData {
  title: string;
  description?: string[];
  contents: StructContents[];
}

export interface StructContents {
  field: string;
  type: string;
  description: string[];
  otherColumns: Record<string, string>;
}

export interface EnumData {
  title: string;
  description?: string[];
  contents: EnumContents[];
}

export interface EnumContents {
  value: string;
  name: string;
  description: string[];
  otherColumns: Record<string, string>;
}

export interface BitfieldData {
  title: string;
  description?: string[];
  contents: BitfieldContents[];
}

export interface BitfieldContents {
  value: string;
  name: string;
  description: string[];
  otherColumns: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class TypeGenerator {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static handleStruct(data: StructData): string {
    throw new Error("Not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static handleEnum(data: EnumData): string {
    throw new Error("Not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static handleBitfield(data: BitfieldData): string {
    throw new Error("Not implemented.");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static parseTypeArray(key: string | null, typeName: string): string {
    throw new Error("Not implemented");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected static parseTypeMap(key: string | null, typeName: string): string {
    throw new Error("Not implemented");
  }

  /**
   * Checks if an HTML element is a block-level element.
   * @param element The HTML element to check.
   * @returns True if the element is block-level, false otherwise.
   */
  private static isBlockLevelElement(element: HTMLElement): boolean {
    const blockLevelTags = [
      "DIV",
      "P",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "UL",
      "OL",
      "LI",
      "TABLE",
      "TR",
      "TD",
      "BLOCKQUOTE",
      "PRE",
      "HR",
      "FORM",
    ];
    return blockLevelTags.includes(element.tagName.toUpperCase());
  }

  /**
   * Parse an array of elements into an array of strings.
   *
   * Currently only supports turning <a> into markdown links.
   *
   * @param elements The elements to use for the documentation.
   * @returns The array of strings
   */
  protected static parseDocumentation(elements: HTMLElement[]): string[] | undefined {
    if (elements.length > 0) {
      const output = [];

      // For each element, loop through each child node.
      // If the node is an anchor, convert it to a markdown link.
      // If the node is not an anchor, use the raw textContent.
      for (const line of elements) {
        let lineText = [];
        for (const child of line.childNodes) {
          if (child instanceof HTMLAnchorElement) {
            if (child.textContent) {
              lineText.push(`[${child.textContent.trim()}](${child.href})`);
            }
          } else if (child instanceof HTMLElement) {
            if (child.textContent) {
              lineText.push(child.textContent.trim());
              if (this.isBlockLevelElement(child)) {
                output.push(lineText.join(" "));
                lineText = [];
              }
            }
          } else if (child.textContent) {
            lineText.push(child.textContent.trim());
          }
        }

        if (lineText.length) {
          output.push(lineText.join(" "));
        }
      }

      return output;
    }
  }

  public static parseDOM(rootElement: HTMLElement) {
    if (typeof window === "undefined") return;

    // Currently, only <table> is supported.
    if (!(rootElement instanceof HTMLTableElement)) {
      return;
    }

    // These are the elements between the title and the table's parent.
    // We will use these to generate JSDoc for the struct/enum itself.
    const intermediateElements: HTMLElement[] = [];

    // Walk backwards from the table to find the title.
    let titleElement = rootElement.parentElement;
    while (titleElement && titleElement.tagName !== "H6") {
      if (titleElement !== rootElement.parentElement) intermediateElements.push(titleElement);
      titleElement = titleElement.previousElementSibling as HTMLElement;
    }

    const description = TypeGenerator.parseDocumentation(intermediateElements);

    // Convert any title to CamelCase.
    // If the string is empty, we want to use our fallback.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    let title = (titleElement?.innerText.trim() || "unknown name")
      .split(/[\s_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    if (title.endsWith("Structure")) {
      title = title.replace(/Structure$/, "");
    }

    const rows = [...rootElement.querySelectorAll("tr")];

    // There needs to be at least one header row, and one content row.
    if (rows.length < 2) return;

    const headingRow = rows.shift()!;

    const headings = [...headingRow.querySelectorAll("th")].map((h) => h.innerText);

    const rowCells: HTMLTableCellElement[][] = [];
    for (const row of rows) {
      rowCells.push([...row.querySelectorAll("td")]);
    }

    // There must be at least two columns.
    if (headings.length < 2) return;

    switch (headings[0]) {
      // Struct
      case "FIELD": {
        const struct: StructData = {
          title,
          description,
          contents: [],
        };

        for (const row of rowCells) {
          const content: Partial<StructContents> = {};

          row.forEach((cell, cellId) => {
            const heading = headings[cellId];

            switch (heading) {
              case "FIELD": {
                content.field = cell.innerText;
                break;
              }
              case "TYPE": {
                content.type = cell.innerText;
                break;
              }
              case "DESCRIPTION": {
                content.description = this.parseDocumentation([cell]);
                break;
              }
              default: {
                if (!content.otherColumns) content.otherColumns = {};

                content.otherColumns[heading] = cell.innerText;
              }
            }
          });

          if (!content.type) content.type = `"${content.field}"`;

          struct.contents.push(content as StructContents);
        }

        return this.handleStruct(struct);
      }

      // Enum or Bitfield
      case "VALUE": {
        const isBitfield = rowCells.some((row) =>
          row.some((cell, cellId) => headings[cellId] === "VALUE" && cell.innerText.includes("<<")),
        );

        if (isBitfield) {
          const bitfield: BitfieldData = {
            title,
            description,
            contents: [],
          };

          for (const row of rowCells) {
            const content: Partial<BitfieldContents> = {};

            row.forEach((cell, cellId) => {
              const heading = headings[cellId];

              switch (heading) {
                case "VALUE": {
                  content.value = cell.innerText;
                  break;
                }
                case "NAME": {
                  content.name = cell.innerText;
                  break;
                }
                case "DESCRIPTION": {
                  content.description = this.parseDocumentation([cell]);
                  break;
                }
                default: {
                  if (!content.otherColumns) content.otherColumns = {};

                  content.otherColumns[heading] = cell.innerText;
                }
              }
            });

            bitfield.contents.push(content as BitfieldContents);
          }

          return this.handleBitfield(bitfield);
        }

        const enumType: EnumData = {
          title,
          description,
          contents: [],
        };

        for (const row of rowCells) {
          const content: Partial<BitfieldContents> = {};

          row.forEach((cell, cellId) => {
            const heading = headings[cellId];

            switch (heading) {
              case "VALUE": {
                content.value = cell.innerText;
                break;
              }
              case "NAME": {
                content.name = cell.innerText;
                break;
              }
              case "DESCRIPTION": {
                content.description = this.parseDocumentation([cell]);
                break;
              }
              default: {
                if (!content.otherColumns) content.otherColumns = {};

                content.otherColumns[heading] = cell.innerText;
              }
            }
          });

          // For enums like UPDATE_AGREEMENTS = "UPDATE_AGREEMENTS",
          // the table only contains VALUE and DESCRIPTION.
          if (!content.name && content.value) {
            content.name = content.value;
            content.value = `"${content.value.split(/\s/)[0]}"`;
          }

          enumType.contents.push(content as BitfieldContents);
        }

        return this.handleEnum(enumType);
      }
    }
  }

  /**
   * Take in a type name (e.g. `map[integer, ?something goes here object]`)
   * and convert it into a TypeScript type (e.g. `Record<number, SomethingGoesHere | null>`)
   * @param typeName The type name to parse
   * @returns The parsed type name
   */
  protected static parseType(
    key: string | null,
    typeName: string,
    typeMap: Record<string, string> = {},
    origNullableStr?: (inner: string, isNullable: boolean, isUndefinable: boolean) => string,
  ): string {
    typeName = typeName.trim();

    console.log(key, typeName);

    const isUndefinable = key?.trim().endsWith("?") ?? false;

    // If the type starts with a `?`, it's nullable, so we mark the boolean and strip the ? from the type name.
    const isNullable = typeName.startsWith("?");
    typeName = isNullable ? typeName.slice(1) : typeName;

    const nullableStr = (inner: string) =>
      (isNullable || isUndefinable) && origNullableStr ? origNullableStr(inner, isNullable, isUndefinable) : inner;

    if (typeName in typeMap) {
      typeName = typeMap[typeName];
    }

    // This will be suffixed to the end of any type we return, e.g. `${T}${nullableStr}`
    // const nullableStr = () => isNullable ? " | null" : "";

    // If the type ends with ` object`, convert it to camel case.
    // e.g. `some thing goes here object` becomes `SomeThingGoesHere`.
    if (typeName.endsWith(" object")) {
      const type = typeName
        .slice(0, -7) // Remove " object" from the end
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");

      return nullableStr(type);
    }

    // If the type is an array, grab the inner type and parse that, then return it.
    if (typeName.startsWith("array[")) {
      console.log({ key, typeName, isNullable, isUndefinable, res: nullableStr(this.parseTypeArray(key, typeName)) });
      return nullableStr(this.parseTypeArray(key, typeName));
    }

    // If the type is a map, grab the left (T) and right (V) types, and convert it to a Record<T, V>.
    if (typeName.startsWith("map[")) {
      return nullableStr(this.parseTypeMap(key, typeName));
    }

    // Return the final type
    return nullableStr(typeName);
  }
}
