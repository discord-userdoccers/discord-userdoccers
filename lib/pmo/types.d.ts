export declare namespace PMO {
  export interface Base {
    type: string;
    name: string;
    description: string | null;
  }

  export interface Member {
    name: string;
    description: string | null;
    deprecated: string | boolean;
    deleted: boolean;
    notes: (string | number)[];
  }

  export interface Structure extends Base {
    type: "structure";
    properties: Property[];
  }

  export interface Property extends Member {
    type: Types.Any;
    optional: boolean;
    nullable: boolean;
  }

  export interface Enum extends Base {
    type: "enum";
    variants: Variant[];
  }

  export interface Variant extends Member {
    value: number | string;
  }

  export interface Flags extends Base {
    type: "flags";
    flags: Flag[];
  }

  export interface Flag extends Member {
    initial: number;
    shift: number;
  }

  export namespace Types {
    export type Any = Snowflake | ISO8601Date | Primitive | Union | Array | Tuple | Map | Reference;

    export interface Definition {
      type: string;
    }

    export interface Snowflake extends Definition {
      type: "snowflake";
    }

    export interface ISO8601Date extends Definition {
      type: "date";
    }

    // Integers and floats are denoted as `Integer` and `Float` respectively
    // in the DSL
    // TODO: maybe something to denote bit width?
    export interface Primitive extends Definition {
      type: "primitive";
      kind: "string" | "integer" | "float" | "boolean" | "null";
    }

    export interface Union extends Definition {
      type: "union";
      elements: Any[];
    }

    export interface Array extends Definition {
      type: "array";
      element: Any;
    }

    export interface Tuple extends Definition {
      type: "tuple";
      elements: Any[];
    }

    // Denoted as Record<key, value> in the DSL
    export interface Map extends Definition {
      type: "map";
      key: Any;
      value: Any;
    }

    export interface Reference extends Definition {
      type: "reference";
      // ["Resources", "Guild", "PartialGuild"]
      path: string[];
    }
  }
}
