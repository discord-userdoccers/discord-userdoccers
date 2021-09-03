export default function InlineCode(props: JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="px-2 py-teensy bg-gray-50 dark:bg-table-row-background-secondary-dark rounded-md"
      {...props}
    />
  );
}
