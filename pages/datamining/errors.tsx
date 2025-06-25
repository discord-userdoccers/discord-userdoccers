import useSWR from "swr";
import ContentWrapper from "../../components/mdx/ContentWrapper";
import { H1, H3 } from "../../components/mdx/Heading";
import { Table, TableData, TableHead, TableHeader, TableRow } from "../../components/mdx/Table";

export default function Errors() {
  const { data: codes, error } = useSWR<{ name: string; codes: Record<string, string> }[]>("/api/codes", (url) =>
    fetch(url).then((res) => res.json()),
  );

  return (
    <ContentWrapper>
      <H1>Error Codes</H1>

      {error ? <p>*{error.message}*</p> : null}
      {codes
        ? codes.map(({ name, codes }) => (
            <>
              <H3>{name}</H3>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeader>Code</TableHeader>
                    <TableHeader>Message</TableHeader>
                  </TableRow>
                </TableHead>
                <tbody>
                  {Object.entries(codes).map(([K, V]) => (
                    <TableRow key={K}>
                      <TableData>{K}</TableData>
                      <TableData>{V}</TableData>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </>
          ))
        : null}
    </ContentWrapper>
  );
}
