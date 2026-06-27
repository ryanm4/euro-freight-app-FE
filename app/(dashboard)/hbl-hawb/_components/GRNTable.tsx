interface GRN {
  id: number
  client_id: string
  manufacture_id: string
  forwarder_id: string
  date: string
  quantity: number
  status: string
  bill_id: string | null
  comments: string | null
  created_by: string
  created_on: string
  updated_by: string | null
  updated_on: string | null
  packing_lists: {
    id: number
    client_id: number
    date: string
    gdn_id: string | null
    grn_id: number
    quantity: number
    created_by: string
    created_on: string
    updated_by: string | null
    updated_on: string | null
  }[]
}

export default function GRNTable({
  grns,
  selectedIds,
  onToggle,
}: {
  grns: GRN[]
  selectedIds: Set<number>
  onToggle: (id: number) => void
}) {
  const allSelected =
    grns.length > 0 && grns.every((g) => selectedIds.has(g.id))
  const toggleAll = () => {
    if (allSelected) grns.forEach((g) => onToggle(g.id))
    else
      grns.forEach((g) => {
        if (!selectedIds.has(g.id)) onToggle(g.id)
      })
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-700 bg-neutral-800">
            <th className="w-10 px-3 py-2.5">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-3.5 w-3.5 rounded border-neutral-600 accent-zinc-400"
              />
            </th>
            {[
              "GRN ID",
              "Client",
              "Manufacturer",
              "Forwarder",
              "Date",
              "Qty",
              "Packing Lists",
              //   "Status",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-2.5 text-left text-xs font-medium whitespace-nowrap text-zinc-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grns.map((grn, i) => (
            <tr
              key={grn.id}
              onClick={() => onToggle(grn.id)}
              className={`cursor-pointer border-b border-neutral-700/60 transition-colors last:border-0 ${
                selectedIds.has(grn.id)
                  ? "bg-zinc-800/60"
                  : i % 2 === 0
                    ? "bg-transparent"
                    : "bg-neutral-800/20"
              } hover:bg-zinc-800/40`}
            >
              <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(grn.id)}
                  onChange={() => onToggle(grn.id)}
                  className="h-3.5 w-3.5 rounded border-neutral-600 accent-zinc-400"
                />
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-zinc-300">
                #{grn.id}
              </td>
              <td className="px-3 py-2.5 text-zinc-200">{grn.client_id}</td>
              <td className="px-3 py-2.5 text-zinc-300">
                {grn.manufacture_id}
              </td>
              <td className="px-3 py-2.5 text-zinc-300">{grn.forwarder_id}</td>
              <td className="px-3 py-2.5 whitespace-nowrap text-zinc-300">
                {new Date(grn.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-3 py-2.5 text-zinc-300">
                {grn.quantity.toLocaleString()}
              </td>
              <td className="px-3 py-2.5 text-zinc-400">
                {grn.packing_lists.length}
              </td>
              {/* <td className="px-3 py-2.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    grn.status === "Pending"
                      ? "bg-yellow-900/40 text-yellow-400"
                      : grn.status === "Completed"
                        ? "bg-green-900/40 text-green-400"
                        : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  {grn.status}
                </span>
              </td> */}
            </tr>
          ))}
          {grns.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-3 py-8 text-center text-xs text-zinc-500"
              >
                No GRNs available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
