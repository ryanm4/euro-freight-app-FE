import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface GRN {
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
  readOnly = false,
}: {
  grns: GRN[]
  selectedIds?: Set<number>
  onToggle?: (id: number) => void
  readOnly?: boolean
}) {
  const headers = [
    "GRN ID",
    "Client",
    "Manufacturer",
    "Forwarder",
    "Date",
    "Qty",
    "Packing Lists",
  ]
  if (!readOnly) headers.push("Actions")

  const columnCount = headers.length

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-700">
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-700 hover:bg-transparent">
            {headers.map((h) => (
              <TableHead
                key={h}
                className="text-xs font-medium whitespace-nowrap text-zinc-400"
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {grns.map((grn, i) => (
            <TableRow
              key={grn.id}
              onClick={readOnly ? undefined : () => onToggle?.(grn.id)}
              className={`border-neutral-800 transition-colors ${
                readOnly ? "" : "cursor-pointer"
              } ${
                !readOnly && selectedIds?.has(grn.id)
                  ? "bg-zinc-800/60"
                  : i % 2 === 0
                    ? "bg-transparent"
                    : "bg-neutral-800/20"
              } ${readOnly ? "hover:bg-neutral-800/40" : "hover:bg-zinc-800/40"}`}
            >
              <TableCell className="font-mono text-xs text-zinc-300">
                #{grn.id}
              </TableCell>
              <TableCell className="text-zinc-200">{grn.client_id}</TableCell>
              <TableCell className="text-zinc-300">
                {grn.manufacture_id}
              </TableCell>
              <TableCell className="text-zinc-300">
                {grn.forwarder_id}
              </TableCell>
              <TableCell className="whitespace-nowrap text-zinc-300">
                {new Date(grn.date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell className="text-zinc-300">
                {grn.quantity.toLocaleString()}
              </TableCell>
              <TableCell className="text-zinc-400">
                {grn?.packing_lists?.length}
              </TableCell>
              {!readOnly && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds?.has(grn.id) ?? false}
                    onChange={() => onToggle?.(grn.id)}
                    className="h-3.5 w-3.5 rounded border-neutral-600 accent-zinc-400"
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
          {grns.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                className="py-8 text-center text-xs text-zinc-500"
              >
                No GRNs available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
