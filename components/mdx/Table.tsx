export function Table(props: JSX.IntrinsicElements["table"]) {
  return (
    <div className="max-w-full overflow-auto">
      <table
        className="align-middle w-full break-words text-sm rounded border-collapse overflow-hidden"
        {...props}
      />
    </div>
  );
}

export function TableHead(props: JSX.IntrinsicElements["thead"]) {
  return (
    <thead
      className="dark:bg-table-head-background-dark bg-table-head-background-light text-left"
      {...props}
    />
  );
}

// border-bottom: 1px solid #040405;
//     background-color: #202225;
export function TableHeader(props: JSX.IntrinsicElements["th"]) {
  return <th className="p-2 uppercase" {...props} />;
}

// margin-top: 0;
// border: 1px solid transparent;
export function TableRow(props: JSX.IntrinsicElements["tr"]) {
  return (
    <tr
      className="text-text-light dark:text-text-dark dark:even:bg-table-row-background-primary-dark dark:bg-table-row-background-secondary-dark even:bg-table-row-background-primary-light bg-table-row-background-secondary-light"
      {...props}
    />
  );
}

export function TableData(props: JSX.IntrinsicElements["td"]) {
  return <td className="p-2 max-w-xs" {...props} />;
}
