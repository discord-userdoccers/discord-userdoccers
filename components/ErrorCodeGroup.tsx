import { useEffect, useRef, useState } from "react";
import Chevron from "./icons/Chevron";
import { getNormalisedText, H3 } from "./mdx/Heading";
import { Table, TableData, TableHead, TableHeader, TableRow } from "./mdx/Table";

export default function ErrorCodeGroup({
  name,
  codes,
  index,
  search,
}: {
  name: string;
  codes: Record<string, string>;
  index: number;
  search: string;
}) {
  const [showTable, setShowTable] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      // check if the hash is #{name} or #group-{name}
      const hash = window.location.hash;
      if (hash === `#${getNormalisedText(name)}` || hash === `#${index}`) {
        sectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [sectionRef, window.location.hash, index, name]);

  const filteredCodes = Object.entries(codes)
    .filter(([K, V]) => K.includes(search) || V.toLowerCase().includes(search))
    .map(([K, V]) => (
      <TableRow key={K}>
        <TableData>{K}</TableData>
        <TableData>{V}</TableData>
      </TableRow>
    ));

  if (!filteredCodes.length) return null;

  return (
    <section ref={sectionRef}>
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
          <tbody>{filteredCodes}</tbody>
        </Table>
      )}
    </section>
  );
}
