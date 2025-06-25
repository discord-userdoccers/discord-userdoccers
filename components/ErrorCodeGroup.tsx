import { useState } from "react";
import Chevron from "./icons/Chevron";
import { H3 } from "./mdx/Heading";
import { Table, TableData, TableHead, TableHeader, TableRow } from "./mdx/Table";

export default function ErrorCodeGroup({ name, codes }: { name: string; codes: Record<string, string> }) {
  const [showTable, setShowTable] = useState(true);

  return (
    <section>
      <button onClick={() => setShowTable(!showTable)}>
        <H3 useAnchor={false} useCopy={false} className="flex justify-start items-start cursor-pointer gap-2">
          <div>{name}</div>
          <Chevron
            className="h-5 w-4 text-black dark:text-white"
            style={{
              transform: showTable ? "rotate(0deg)" : "rotate(-180deg)",
              transition: "transform 0.2s ease-in-out",
            }}
          />
        </H3>
      </button>
      {showTable && (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Code</TableHeader>
              <TableHeader>Message</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>
            {Object.entries(codes).map(([K, V]) => (
              <TableRow key={K} id={`error-code-${K}`}>
                <TableData id={K}>{K}</TableData>
                <TableData>{V}</TableData>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}
    </section>
  );
}
