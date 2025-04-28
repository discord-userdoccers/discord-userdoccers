export enum NodeType {
  DOM = "DOM",
  DOMLiteral = "DOMLiteral",
  TableRoot = "TableRoot",
  TableHead = "TableHead",
  TableBody = "TableBody",
  TableRow = "TableRow",
  TableCell = "TableCell",
}

export class TypeInfo {
  public readonly optional: boolean;
  public readonly type?: string;
  public readonly multiline?: string[];
  public readonly map?: [TypeInfo, TypeInfo];
  public readonly array?: TypeInfo[];

  public constructor(inner: string[], multiline = false) {
    this.optional = false;

    if (multiline) {
      this.multiline = inner;
      return;
    }

    this.type = inner.join(" ");

    // Check if type is optional.
    if (inner[0].startsWith("?")) {
      this.optional = true;
      inner[0] = inner[0].slice(1);
      this.type = inner.join(" ");
    }

    // If the type ends with "object", convert it to UpperCamelCase and strip "object" from it.
    if (inner[inner.length - 1] === "object" && inner.length > 1) {
      inner.pop();
      inner = inner.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
      this.type = inner.join("").trim();
    }

    // If type is array, recurse down the array.
    let match = /^array\[(.*)\]$/.exec(inner.join(" "));
    if (match?.[1]) {
      const innerContent = match[1].trim();
      const parts = innerContent.split(/,(?![^\[]*\])/);

      if (parts.length > 1) {
        // tuples in userdoccers are defined as array[T1, T2, ...]
        this.array = parts.map(part => new TypeInfo(part.trim().split(" ")));
        this.type = undefined;
      } else {
        // arrays in userdoccers are defined as array[T]
        const innerType = new TypeInfo(parts[0].trim().split(" "));
        this.array = [innerType];
        this.type = undefined;
      }
    }

    // If the type is map, recurse down the map.
    match = /^map\[(.+), (.+)]$/.exec(inner.join(" "));
    if (match?.[2]) {
      const leftType = new TypeInfo(match[1].trim().split(" "));
      const rightType = new TypeInfo(match[2].trim().split(" "));

      this.map = [leftType, rightType];
      this.type = undefined;
    }
  }
}

export class BaseNode {
  /** The type of AST Node */
  public readonly type: NodeType;
  /** The original element the AST Node belongs to */
  public readonly elem: HTMLElement;
  /** The parent node of the AST Node */
  public parent: BaseNode | null;
  /** An array of child AST Nodes */
  public children: BaseNode[];

  public constructor(type: NodeType, elem: HTMLElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    this.type = type;
    this.elem = elem;
    this.parent = parent;
    this.children = children;
  }
}

/** <table> */
export class TableRootNode extends BaseNode {
  public readonly type: NodeType.TableRoot = NodeType.TableRoot;
  public readonly elem: HTMLTableElement;
  public title: string | null;

  public constructor(
    elem: HTMLTableElement,
    parent: BaseNode | null = null,
    children: BaseNode[] = [],
    title: string | null = null,
  ) {
    super(NodeType.TableRoot, elem, parent, children);
    this.elem = elem;
    this.title = title;
  }

  public getHead(): TableHeadNode | undefined {
    return this.children.find((child) => child.type === NodeType.TableHead) as TableHeadNode | undefined;
  }

  public getBody(): TableBodyNode | undefined {
    return this.children.find((child) => child.type === NodeType.TableBody) as TableBodyNode | undefined;
  }
}

/** <thead> */
export class TableHeadNode extends BaseNode {
  public readonly type: NodeType.TableHead = NodeType.TableHead;
  public readonly elem: HTMLTableSectionElement; // More specific type

  public constructor(elem: HTMLTableSectionElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    super(NodeType.TableHead, elem, parent, children);
    this.elem = elem;
  }

  public getRows(): TableRowNode[] {
    return this.children.filter((child) => child.type === NodeType.TableRow) as TableRowNode[];
  }
}

/** <tbody> */
export class TableBodyNode extends BaseNode {
  public readonly type: NodeType.TableBody = NodeType.TableBody;
  public readonly elem: HTMLTableSectionElement; // More specific type

  public constructor(elem: HTMLTableSectionElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    super(NodeType.TableBody, elem, parent, children);
    this.elem = elem;
  }

  public getRows(): TableRowNode[] {
    return this.children.filter((child) => child.type === NodeType.TableRow) as TableRowNode[];
  }
}

/** <tr> */
export class TableRowNode extends BaseNode {
  public readonly type: NodeType.TableRow = NodeType.TableRow;
  public readonly elem: HTMLTableRowElement;

  public constructor(elem: HTMLTableRowElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    super(NodeType.TableRow, elem, parent, children);
    this.elem = elem;
  }

  public getCells(): TableCellNode[] {
    return this.children.filter((child) => child.type === NodeType.TableCell) as TableCellNode[];
  }
}

/** <th> or <td> */
export class TableCellNode extends BaseNode {
  public readonly type: NodeType.TableCell = NodeType.TableCell;
  public readonly elem: HTMLTableCellElement;

  public constructor(elem: HTMLTableCellElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    super(NodeType.TableCell, elem, parent, children);
    this.elem = elem;
  }

  public getTextContent(): string {
    return this.elem.textContent ?? "";
  }

  /**
   * Get an array of strings from the node as one line (no linebreaks).
   */
  public getStringsSingleLine(withMarkdown = true): string[] {
    let result: string[] = [];
    if (!this.elem.childNodes.length) return [];

    for (const node of this.elem.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() ?? "";
        const parts = text.split(/\s+(?=[^()]*(?:\(|$))/);
        result.push(...parts);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (withMarkdown && element instanceof HTMLAnchorElement) {
          const text = element.textContent?.trim() ?? "";
          const href = element.href;
          result.push(`[${text}](${href})`);
        } else {
          // If it's not an anchor, get its textContent and split it
          const text = element.textContent?.trim() ?? "";
          const parts = text.split(/\s+(?=[^()]*(?:\(|$))/);
          result.push(...parts);
        }
      }
    }

    let s = result.join(" ");
    s = s.replaceAll("array [", "array[");
    s = s.replaceAll("map [", "map[");
    result = s.split(" ");

    return result;
  }

  public getStringFirstWord(): string | undefined {
    const strings = this.getStringsSingleLine();
    if (!strings.length) return;

    return strings[0];
  }

  public getKeyInfo(): TypeInfo | undefined {
    const string = this.getStringFirstWord();
    if (!string) return;

    return new TypeInfo([string]);
  }

  public getTypeInfo(inner?: string[]): TypeInfo | undefined {
    const strings = inner ?? this.getStringsSingleLine(false);
    if (!strings.length) return;

    return new TypeInfo(strings);
  }
}

/**
 * Any DOM element that should be treated as a string.
 * Can contain a mix of text nodes and elements.
 */
export class DOMLiteralNode extends BaseNode {
  public readonly type: NodeType.DOMLiteral = NodeType.DOMLiteral;

  public constructor(elem: HTMLElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    super(NodeType.DOMLiteral, elem, parent, children);
  }

  public getStringContent(): string {
    return this.elem.textContent ?? "";
  }

  public getStringNodes(): string[] {
    if (!this.elem.textContent) return [];
    const trimmed = this.elem.textContent.trim();

    const parts = trimmed.split(/\s+(?=[^()]*(?:\(|$))/);
    return [...parts];
  }
}

/**
 * Represents a generic DOM element within a table cell.
 */
export class DOMNode extends BaseNode {
  public readonly type: NodeType.DOM = NodeType.DOM;

  public constructor(elem: HTMLElement, parent: BaseNode | null = null, children: BaseNode[] = []) {
    super(NodeType.DOM, elem, parent, children);
  }

  public getTagName(): string {
    return this.elem.tagName.toLowerCase();
  }
}

export enum TableType {
  Struct,
  Enum,
  Event,
  Bitfield,
}

export interface StructData {
  type: TableType;
  title: TypeInfo;
  description?: TypeInfo;
  contents: StructContents[];
}

export interface StructContents {
  field: TypeInfo;
  type: TypeInfo;
  description?: TypeInfo;
  otherColumns: [TypeInfo, TypeInfo][];
}

export class Tokenizer {
  public readonly rootNode: TableRootNode;

  public constructor(public readonly root: HTMLTableElement) {
    if (!(this.root instanceof HTMLTableElement)) {
      throw new Error("Root is not a table element");
    }

    this.rootNode = new TableRootNode(this.root, null, [], this.root.getAttribute("title") ?? null);

    this.parseTable();
  }

  public getLayout(): StructData | undefined {
    const tHead = this.rootNode.getHead();
    if (!tHead) return;

    const tBody = this.rootNode.getBody();
    if (!tBody) return;

    const bodyRows = tBody.getRows();

    const tHeadRows = tHead.getRows()[0].getCells();

    const headings = tHeadRows.map((x) => x.getTextContent().toLowerCase());
    if (!headings.length) throw new Error("Failed to get table headings");

    const [title, description] = this.parseTitleAndDescription();

    const struct: StructData = {
      type: TableType.Struct,
      title,
      description,
      contents: [],
    };

    if (headings[0] === "field" && headings[1] === "type") {
      struct.type = TableType.Struct;
    } else if (headings[0] === "value" && headings[1] === "name") {
      struct.type = TableType.Enum;
    } else if (headings[0] === "event" && headings[1] === "value") {
      struct.type = TableType.Event;
    }

    for (const row of bodyRows) {
      let field: TypeInfo | undefined;
      let type: TypeInfo | undefined;
      let description: TypeInfo | undefined;
      const otherColumns: [TypeInfo, TypeInfo][] = [];

      row.getCells().forEach((cell, i) => {
        const columnName = tHeadRows[i].getTextContent().toLowerCase();
        switch (struct.type) {
          case TableType.Struct: {
            if (columnName === "field") {
              field = cell.getTypeInfo();
            } else if (columnName === "type") {
              type = cell.getTypeInfo();
            } else if (columnName === "description") {
              description = cell.getTypeInfo();
            } else {
              const header = tHeadRows[i].getTypeInfo();
              const content = cell.getTypeInfo();
              if (header && content) otherColumns.push([header, content]);
            }
            break;
          }
          case TableType.Event: {
            if (columnName === "event") {
              field = cell.getTypeInfo();
            } else if (columnName === "value") {
              type = cell.getTypeInfo();
            } else if (columnName === "description") {
              description = cell.getTypeInfo();
            } else {
              const header = tHeadRows[i].getTypeInfo();
              const content = cell.getTypeInfo();
              if (header && content) otherColumns.push([header, content]);
            }
            break;
          }
          case TableType.Enum:
          case TableType.Bitfield: {
            if (columnName === "value") {
              type = cell.getTypeInfo();
              if (type?.type?.includes("<<")) {
                struct.type = TableType.Bitfield;
              }
            } else if (columnName === "name") {
              field = cell.getTypeInfo();
            } else if (columnName === "description") {
              description = cell.getTypeInfo();
            } else {
              const header = tHeadRows[i].getTypeInfo();
              const content = cell.getTypeInfo();
              if (header && content) otherColumns.push([header, content]);
            }
            break;
          }
        }
      });

      if (field && type) {
        struct.contents.push({
          field,
          type,
          description,
          otherColumns,
        });
      }
    }

    return struct;
  }

  private createNode(elem: HTMLElement, type: NodeType, parent: BaseNode | null): BaseNode {
    switch (type) {
      case NodeType.TableRoot:
        return new TableRootNode(elem as HTMLTableElement, parent);
      case NodeType.TableHead:
        return new TableHeadNode(elem as HTMLTableSectionElement, parent);
      case NodeType.TableBody:
        return new TableBodyNode(elem as HTMLTableSectionElement, parent);
      case NodeType.TableRow:
        return new TableRowNode(elem as HTMLTableRowElement, parent);
      case NodeType.TableCell:
        return new TableCellNode(elem as HTMLTableCellElement, parent);
      case NodeType.DOMLiteral:
        return new DOMLiteralNode(elem, parent);
      case NodeType.DOM:
        return new DOMNode(elem, parent);
      default:
        return new BaseNode(type, elem, parent);
    }
  }

  private parseTable() {
    const thead = this.root.querySelector("thead");
    const tbody = this.root.querySelector("tbody");

    if (thead) {
      const theadNode = this.createNode(thead, NodeType.TableHead, this.rootNode);
      this.rootNode.children.push(theadNode);
      this.parseRows(thead, theadNode);
    }

    if (tbody) {
      const tbodyNode = this.createNode(tbody, NodeType.TableBody, this.rootNode);
      this.rootNode.children.push(tbodyNode);
      this.parseRows(tbody, tbodyNode);
    }
  }

  private parseRows(container: HTMLHeadElement | HTMLBodyElement, parentNode: BaseNode) {
    const rows = container.querySelectorAll("tr");
    rows.forEach((row) => {
      const rowNode = new TableRowNode(row, parentNode);
      parentNode.children.push(rowNode);
      this.parseCells(row, rowNode);
    });
  }

  private parseCells(row: HTMLTableRowElement, parentNode: TableRowNode) {
    const cells = row.querySelectorAll("th, td");
    cells.forEach((cell) => {
      const cellNode = new TableCellNode(cell as HTMLTableCellElement, parentNode);
      parentNode.children.push(cellNode);
      this.parseCellContent(cell as HTMLTableCellElement, cellNode);
    });
  }

  private parseCellContent(cell: HTMLTableCellElement, parentNode: BaseNode) {
    cell.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = new DOMLiteralNode(node as Text as unknown as HTMLElement, parentNode);
        parentNode.children.push(textNode);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const domNode = new DOMNode(element, parentNode);
        parentNode.children.push(domNode);
        this.parseCellContent(element as HTMLTableCellElement, domNode); // Recursively parse children
      }
    });
  }

  private parseTitleAndDescription(): [TypeInfo, TypeInfo] {
    const rootElement = this.root;
    const intermediateElements: HTMLElement[] = [];

    let titleElement = rootElement.parentElement;
    while (titleElement && titleElement.tagName !== "H6") {
      if (titleElement !== rootElement.parentElement) intermediateElements.push(titleElement);
      titleElement = titleElement.previousElementSibling as HTMLElement;
    }

    let title = titleElement?.textContent
      ? titleElement.textContent
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("")
        .split("(")[0] // if the title is `some thing (here)` it should be SomeThing
      : "UnknownStruct";

    if (title.endsWith("Structure")) {
      title = title.slice(0, -"Structure".length);
    }

    const description: string[] = [];

    for (const el of intermediateElements) {
      const elem = el.cloneNode(true) as HTMLElement;
      const links = elem.querySelectorAll("a");

      links.forEach((link) => {
        const url = link.href;
        const innerText = link.textContent;
        const span = document.createElement("span");
        span.textContent = `[${innerText}](${url})`;
        link.replaceWith(span);
      });

      // This is so cursed, but if the element isn't in the DOM, textContent/innerText is incorrect.
      elem.style.position = "absolute";
      elem.style.opacity = "0";
      elem.style.clipPath = "inset(100%)";
      elem.style.pointerEvents = "none";
      elem.style.top = "-9999px";
      elem.style.left = "-9999px";

      document.body.appendChild(elem);
      description.push(...elem.innerText.split("\n"));
      document.body.removeChild(elem);
    }

    return [new TypeInfo([title]), new TypeInfo(description, true)];
  }

  public getAST(): TableRootNode {
    return this.rootNode;
  }
}
