export function Table(props: JSX.IntrinsicElements["table"]) {
  return (
    <div className="max-w-full overflow-auto">
      <table
        className="w-full border-collapse overflow-hidden break-words rounded-md align-middle text-sm"
        {...props}
      />
    </div>
  );
}

export function TableHead(props: JSX.IntrinsicElements["thead"]) {
  return <thead className="dark:bord-white border-b-2 border-gray-300 text-left dark:border-black" {...props} />;
}

export function TableHeader(props: JSX.IntrinsicElements["th"]) {
  return <th className="bg-gray-200 p-2 px-3 uppercase dark:bg-table-head-background-dark" {...props} />;
}

export function TableRow(props: JSX.IntrinsicElements["tr"]) {
  return (
    <tr
      className="bg-gray-100 text-text-light even:bg-gray-50 dark:bg-trueGray-800 dark:text-text-dark dark:even:bg-trueGray-900"
      {...props}
    />
  );
}

export function TableData(props: JSX.IntrinsicElements["td"]) {
  return <td className="max-w-xs p-2 px-3" {...props} />;
}
