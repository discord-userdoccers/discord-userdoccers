export default function InlineCode(props: JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="dark:bg-table-row-background-secondary-dark pb-1 pl-2 pr-2 pt-1 rounded-md"
      {...props}
    />
  );
}
