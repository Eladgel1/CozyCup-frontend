export function Table({ columns = [], rows = [], keyField = 'id', empty = 'No data' }) {
  if (!rows?.length) return <div className="card p-4">{empty}</div>;
  return (
    <div className="overflow-x-auto card p-0">
      <table className="min-w-full text-sm">
        <thead className="bg-black/5">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-2 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[keyField]} className="border-t">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2">{c.render ? c.render(r) : r[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
