import { useEffect, useMemo, useRef, useState } from "react";
import { useHash } from "../../hooks/useHash";
import Styles from "../../stylesheets/modules/Errors.module.css";
import Chevron from "../icons/Chevron";
import { getNormalisedText, H3 } from "../mdx/Heading";
import { Table, TableData, TableHead, TableHeader, TableRow } from "../mdx/Table";

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
  const ref = useRef<HTMLElement>(null);
  const hash = useHash();

  useEffect(() => {
    if (ref.current) {
      // check if the hash is #{name} or #group-{name}
      if (hash === `#${getNormalisedText(name)}` || hash === `#${index}`) {
        ref.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [index, name, hash]);

  const isGroupMatch = search ? name.toLowerCase().includes(search) : true;
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
          if (isGroupMatch) return true;
          if (code.toString() === search || code.includes(search)) return true;
          if (search && !message.toLowerCase().includes(search)) return false;
          return true;
        })
        .map(([code, { message, isUnknown }]) => (
          <ErrorCode key={code} code={code} message={message} isUnknown={isUnknown} />
        )),
    [search, unknownOnly, processedCodes, isGroupMatch],
  );

  if (filteredCodes.length === 0) {
    return null;
  }

  // Generate unique ids for accessibility
  const headingId = `error-group-heading-${index}`;
  const tableId = `error-group-table-${index}`;

  return (
    <section ref={ref} aria-labelledby={headingId} role="region">
      <H3 role="heading" id={headingId} useAnchor={false} useCopy={false}>
        <button
          aria-expanded={showTable}
          aria-controls={tableId}
          aria-label={`Expand group: ${name}`}
          onClick={() => setShowTable(!showTable)}
          className={Styles.groupButton}
        >
          <div>{name}</div>
          <Chevron
            className={Styles.groupIcon}
            style={{
              transform: showTable ? "rotate(0deg)" : "rotate(-180deg)",
            }}
          />
        </button>
      </H3>
      {showTable && (
        <Table id={tableId} aria-describedby={headingId} useCodegen={false}>
          <caption className="sr-only">Error codes for {name}</caption>
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
  const ref = useRef<HTMLTableRowElement>(null);
  const hash = useHash();

  useEffect(() => {
    if (ref.current && hash === `#${code}`) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash, code]);

  return (
    <TableRow key={code} ref={ref}>
      <TableData>{code}</TableData>
      <TableData>
        {isUnknown ? (
          <>
            <span aria-hidden="true">⚠️</span>
            <span className="sr-only">Unknown message</span>
          </>
        ) : null}{" "}
        {message}
      </TableData>
    </TableRow>
  );
};
