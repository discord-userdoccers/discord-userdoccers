import { PMO } from "@lib/pmo/types";
import React from "react";
import Code from "./Code";

// TODO: useContext here and set model
//       use the same contetxt downstream in tables passed over to @lib/type-generator
export default function Model({ children, model }: React.PropsWithChildren<{ model: PMO.Model }>) {
  return (
    <>
      <Code className="language-json">{JSON.stringify(model, undefined, 2)}</Code>
      {children}
    </>
  );
}
