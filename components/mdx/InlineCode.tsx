export default function InlineCode(props: JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="py-teensy px-2 bg-gray-50 dark:bg-table-row-background-secondary-dark rounded-md"
      {...props}
    />
  );
}
