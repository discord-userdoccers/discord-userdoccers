import { PMO } from "@lib/pmo/types";
import React from "react";

export default function Model({ children, model }: React.PropsWithChildren<{ model: PMO.Model }>) {
    return <>
        {children}
    </>
}