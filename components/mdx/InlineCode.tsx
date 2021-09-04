export default function InlineCode(props: JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="px-2 py-teensy bg-sidebar-tertiary-light dark:bg-table-row-background-secondary-dark rounded-md"
      {...props}
    />
  );
}
