import { RESTMethod, RouteHeaderProps } from "@components/RouteHeader";

export interface EndpointFlags {
  supportsAuditReason: boolean;
  unauthenticated: boolean;
  mfa: boolean;
  supportsOAuth2?: string | boolean;
  deprecated: boolean;
}

export interface EndpointData {
  name: Name;
  description: string[];
  endpoint: string;
  hasQueryParams: boolean;
  flags: EndpointFlags;
  method: RESTMethod;
}

export class Tokenizer {
  public constructor(
    public readonly root: HTMLDivElement,
    public readonly info: RouteHeaderProps,
  ) {}

  public getData(): EndpointData {
    const name = this.info.children!.toString();

    const [hasQueryParams, description] = this.parseQueryParamsAndDescription();

    const flags: EndpointFlags = {
      supportsAuditReason: this.info.supportsAuditReason ?? false,
      unauthenticated: this.info.unauthenticated ?? false,
      mfa: this.info.mfa ?? false,
      supportsOAuth2: this.info.supportsOAuth2,
      deprecated: this.info.deprecated ?? false,
    };

    const data: EndpointData = {
      name: new Name(name),
      endpoint: this.info.url,
      description,
      hasQueryParams,
      flags,
      method: this.info.method,
    };

    return data;
  }

  private parseQueryParamsAndDescription(): [boolean, string[]] {
    const intermediateElements: HTMLElement[] = [];
    let hasQueryParams = true;

    let tableTitleElement = this.root.parentElement;
    while (tableTitleElement && tableTitleElement.tagName !== "H6") {
      if (tableTitleElement !== this.root.parentElement) intermediateElements.push(tableTitleElement);
      tableTitleElement = tableTitleElement.nextElementSibling as HTMLElement;
      if (!tableTitleElement || tableTitleElement.firstElementChild?.tagName === "H3") {
        // if the endpoint doesnt have any tables at all then it obviously has no params
        hasQueryParams = false;
        break;
      }
    }

    hasQueryParams = tableTitleElement?.textContent?.split(" ")[0].toLowerCase() === "query" && hasQueryParams;

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

    return [hasQueryParams, description];
  }
}

export class Name {
  public constructor(public name: string) {}

  public toSnakeCase(): string {
    return this.name.toLowerCase().replaceAll(" ", "_");
  }

  public toPascalCase(): string {
    return this.name
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  }

  public toCamelCase(): string {
    return this.name
      .toLowerCase()
      .split(" ")
      .map((word, i) => (i === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()))
      .join("");
  }
}
