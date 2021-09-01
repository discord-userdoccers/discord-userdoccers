export function Table(props) {
  return (
    <table
      className="align-middle w-full break-words text-sm rounded border-collapse overflow-hidden"
      {...props}
    />
  );
}

export function TableHead(props) {
  return (
    <thead
      className="dark:bg-table-head-background-dark bg-table-head-background-light text-left"
      {...props}
    />
  );
}

// border-bottom: 1px solid #040405;
//     background-color: #202225;
export function TableHeader(props) {
  return <th className="p-2 uppercase" {...props} />;
}

// margin-top: 0;
// border: 1px solid transparent;
export function TableRow(props) {
  return (
    <tr
      className="text-text-light dark:text-text-dark dark:even:bg-table-row-background-primary-dark dark:bg-table-row-background-secondary-dark even:bg-table-row-background-primary-light bg-table-row-background-secondary-light"
      {...props}
    />
  );
}

export function TableData(props) {
  return <td className="p-2 max-w-xs" {...props} />;
}
