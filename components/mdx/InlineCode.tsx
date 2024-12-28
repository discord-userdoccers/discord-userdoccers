export default function InlineCode(props: JSX.IntrinsicElements["code"]) {
  return (
    <code
      className="rounded-md bg-sidebar-tertiary-light px-2 py-teensy text-sm dark:bg-table-row-background-secondary-dark"
      {...props}
    />
  );
}
