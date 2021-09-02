export default function InlineCode(props: JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="pb-1 px-2 py-1 bg-gray-50 dark:bg-table-row-background-secondary-dark rounded-md"
      {...props}
    />
  );
}
