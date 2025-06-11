import { PMO } from "@lib/pmo/types";
import React from "react";

// TODO: useContext here and set model
//       use the same contetxt downstream in tables passed over to @lib/type-generator
export default function Model({ children }: React.PropsWithChildren<{ model: PMO.Model }>) {
  return <>{children}</>;
}

