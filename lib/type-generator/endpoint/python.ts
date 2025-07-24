import { RouteHeaderProps } from "@components/RouteHeader";
import { Tokenizer } from "./tokenizer";

export class PythonEndpointGenerator {
  public readonly tokenizer: Tokenizer;

  public constructor(rootElement: HTMLDivElement, info: RouteHeaderProps) {
    this.tokenizer = new Tokenizer(rootElement, info);
  }

  public generateCode() {}
}
