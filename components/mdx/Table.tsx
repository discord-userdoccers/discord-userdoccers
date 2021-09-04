export function Table(props: JSX.IntrinsicElements["table"]) {
  return (
    <div className="max-w-full overflow-auto">
      <table
        className="align-middle w-full break-words text-sm rounded-md border-collapse overflow-hidden"
        {...props}
      />
    </div>
  );
}

export function TableHead(props: JSX.IntrinsicElements["thead"]) {
  return (
    <thead
      className="dark:bord-white text-left border-b-2 dark:border-black border-gray-300"
      {...props}
    />
  );
}

export function TableHeader(props: JSX.IntrinsicElements["th"]) {
  return (
    <th
      className="p-2 px-3 bg-gray-200 dark:bg-table-head-background-dark uppercase"
      {...props}
    />
  );
}

export function TableRow(props: JSX.IntrinsicElements["tr"]) {
  return (
    <tr
      className="dark:even:bg-trueGray-900 dark:bg-trueGray-800 dark:text-text-dark text-text-light even:bg-gray-50 bg-gray-100"
      {...props}
    />
  );
}

export function TableData(props: JSX.IntrinsicElements["td"]) {
  return <td className="p-2 px-3 max-w-xs" {...props} />;
}
