import { useEffect, useMemo, useRef, useState } from "react";
import Chevron from "./icons/Chevron";
import { getNormalisedText, H3 } from "./mdx/Heading";
import { Table, TableData, TableHead, TableHeader, TableRow } from "./mdx/Table";

const UNKNOWN_REGEX = /^[A-Z0-9_ ()]+$/;

export default function ErrorCodeGroup({
  name,
  codes,
  index,
  search,
  unknownOnly,
}: {
  name: string;
  codes: Record<string, string>;
  index: number;
  search: string;
  unknownOnly: boolean;
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

  const processedCodes = useMemo(
    () =>
      Object.entries(codes).map(([K, V]): [string, { message: string; isUnknown: boolean }] => {
        const isUnknown = UNKNOWN_REGEX.test(V);
        const message = V.replace(/ \(UNKNOWN\)$/i, "");
        return [K, { message, isUnknown }];
      }),
    [codes],
  );

  const filteredCodes = useMemo(
    () =>
      processedCodes
        .filter(([code, { message, isUnknown }]) => {
          if (unknownOnly && !isUnknown) return false;
          if (
            search &&
            !message.toLowerCase().includes(search.toLowerCase()) &&
            !code.toLowerCase().includes(search.toLowerCase())
          )
            return false;
          return true;
        })
        .map(([code, { message, isUnknown }]) => (
          <ErrorCode key={code} code={code} message={message} isUnknown={isUnknown} />
        )),
    [codes, unknownOnly, search],
  );

  if (filteredCodes.length === 0) {
    return null;
  }

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

const ErrorCode = ({ code, message, isUnknown }: { code: string; message: string; isUnknown: boolean }) => {
  return (
    <TableRow key={code}>
      <TableData>{code}</TableData>
      <TableData>
        {isUnknown ? "⚠️" : ""} {message}
      </TableData>
    </TableRow>
  );
};
