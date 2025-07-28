import { RouteHeaderProps } from "@components/RouteHeader";
import { Name, Tokenizer } from "./tokenizer";

export class RustEndpointGenerator {
  public readonly tokenizer: Tokenizer;

  public constructor(rootElement: HTMLDivElement, info: RouteHeaderProps) {
    this.tokenizer = new Tokenizer(rootElement, info);
  }

  public generateCode() {
    const data = this.tokenizer.getData();

    let output = "";
    const comment: string[] = [];

    comment.push(`/// Method: \`${data.method}\``);

    if (data.flags.mfa) comment.push("/// Valid MFA code is required for some actions");
    if (data.flags.supportsAuditReason) comment.push("/// Supports the `X-Audit-Log-Reason header`");
    if (data.flags.unauthenticated) comment.push("/// Does not require authentication");
    if (data.flags.supportsOAuth2)
      comment.push(
        `/// Supports OAuth2 for authentication${typeof data.flags.supportsOAuth2 === "string" ? ` with the \`${data.flags.supportsOAuth2}\` scope` : ""}`,
      );

    for (const line of data.description) comment.push(`/// ${line}`);

    output += comment.join("\n///\n") + "\n";

    if (data.flags.deprecated) output += "#[deprecated]\n";

    if (data.endpoint.includes("{") || data.hasQueryParams) {
      const [cleanPath, params] = this.parsePath(data.endpoint);

      output += `pub fn ${data.name.toSnakeCase().toUpperCase()}(${data.hasQueryParams ? `query: &${data.name.toPascalCase()}QueryParams${params.length ? ", " : ""}` : ""}${params
        .map((s) => {
          return s.toSnakeCase() + ": &" + s.toPascalCase();
        })
        .join(", ")}) -> String {\n`;

      output += `\tformat!("${cleanPath}${data.hasQueryParams ? "?{}" : ""}"${params.length ? ", " + params.map((s) => {return s.toSnakeCase()}).join(", ") : ""}${data.hasQueryParams ? ", serde_urlencoded::to_string(query).unwrap_or_default()" : ""})\n`;

      output += "}\n";
    } else {
      output += `pub const ${data.name.toSnakeCase().toUpperCase()}: &str = "${data.endpoint}";\n`;
    }

    return output;
  }

  private parsePath(path: string): [string, Name[]] {
    const paramNames: Name[] = [];

    const parsedPath = path.replaceAll(/{((?:\w|\.)+)}/g, (_, param) => {
      paramNames.push(new Name(param.replaceAll(".", " ")));
      return "{}";
    });

    return [parsedPath, paramNames];
  }
}
