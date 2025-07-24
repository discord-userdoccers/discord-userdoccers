import { RouteHeaderProps } from "@components/RouteHeader";
import { Name, Tokenizer } from "./tokenizer";

export class TypescriptEndpointGenerator {
  public readonly tokenizer: Tokenizer;

  public constructor(rootElement: HTMLDivElement, info: RouteHeaderProps) {
    this.tokenizer = new Tokenizer(rootElement, info);
  }

  public generateCode() {
    const data = this.tokenizer.getData();

    let output= "";
    let comment: string[] = [];

    comment.push(` * Method: \`${data.method}\``);

    if (data.flags.deprecated) comment.push(" * @deprecated")

    if (data.flags.mfa) comment.push(" * Valid MFA code is required for some actions");
    if (data.flags.supportsAuditReason) comment.push(" * Supports the `X-Audit-Log-Reason header`");
    if (data.flags.unauthenticated) comment.push(" * Does not require authentication");
    if (data.flags.supportsOAuth2) comment.push(` * Supports OAuth2 for authentication${typeof data.flags.supportsOAuth2 === "string" ? ` with the \`${data.flags.supportsOAuth2}\` scope` : ""}`);
    
    for (const line of data.description) comment.push(` * ${line}`);

    output += "/**\n" + comment.join("\n *\n") + "\n */\n";


    if (data.endpoint.includes("{") || data.hasQueryParams) {
      let [cleanPath, params] = this.parsePath(data.endpoint);

      output += `export function ${data.name.toSnakeCase().toUpperCase()}(${data.hasQueryParams ? `query: ${data.name.toPascalCase()}QueryParams${params.length ? ", " : ""}` : ""}${params.map((s) => {return s + ": any"}).join(", ")}): string {\n`;

      output += `\treturn \`${cleanPath}${data.hasQueryParams ? "?${new URLSearchParams(Object.entries(query)).toString()}" : ""}\`;\n`;

      output += "}\n";
    } else {
      output = `pub const ${data.name.toSnakeCase().toUpperCase()}: &str = "${data.endpoint}"\n`;
    }

    return output;
  }

  private parsePath(path: string): [string, string[]] {
    const paramNames: string[] = [];

    const parsedPath = path.replaceAll(/{(.+)}/g, (_, param) => {
        const name = new Name(param.replace(".", " ")).toCamelCase();
        paramNames.push(name);
        return `\${${name}}`;
    });

    return [parsedPath, paramNames];
  }
}
``