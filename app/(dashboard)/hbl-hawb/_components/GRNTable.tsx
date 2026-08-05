import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { format } from "date-fns"

export interface PackingList {
  id: number
  packing_list_no: string
  client_id: number
  manufacturer_id: number
  date: string
  gdn_id: number
  grn_id: number
  total_quantity: number
  ship_to: string
  shipping_mode: string
  status: string
  created_by: string
  created_on: string
  updated_by: string | null
  updated_on: string | null
}
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
  packing_lists: PackingList[] | null
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
    "Packing List IDs",
    "Client",
    "Manufacturer",
    "Forwarder",
    "Date",
    "Qty",
    "Packing Lists",
    "Status",
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
                {grn.id}
              </TableCell>
              <TableCell className="text-zinc-300">
                <TooltipProvider>
                  <div className="flex flex-wrap gap-2">
                    {grn.packing_lists?.map((pl) => (
                      <Tooltip key={pl.id}>
                        <TooltipTrigger asChild>
                          <span className="cursor-pointer text-primary hover:underline">
                            {pl.id}
                          </span>
                        </TooltipTrigger>

                        <TooltipContent side="top" className="max-w-xs">
                          <div className="space-y-1 text-sm">
                            <p>
                              <strong>Packing List:</strong>{" "}
                              {pl.packing_list_no}
                            </p>
                            <p>
                              <strong>GDN:</strong> {pl.gdn_id}
                            </p>
                            <p>
                              <strong>Shipping Mode:</strong> {pl.shipping_mode}
                            </p>
                            <p>
                              <strong>Recipient:</strong> {pl.ship_to}
                            </p>
                            <p>
                              <strong>Total Cartons:</strong>{" "}
                              {pl.total_quantity}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {format(new Date(pl.date), "PPP")}
                            </p>
                            <p>
                              <strong>Status:</strong> {pl.status}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </TableCell>
              <TableCell className="text-zinc-200">{grn.client_id}</TableCell>
              <TableCell className="text-zinc-300">
                {grn.manufacture_id}
              </TableCell>
              <TableCell className="text-zinc-300">
                {grn.forwarder_id}
              </TableCell>
              <TableCell className="whitespace-nowrap text-zinc-300">
                {format(new Date(grn.date), "dd/MMM/yy HH:mm")}
              </TableCell>
              <TableCell className="text-zinc-300">
                {grn.quantity.toLocaleString()}
              </TableCell>
              <TableCell className="text-zinc-400">
                {grn?.packing_lists?.length}
              </TableCell>
              <TableCell className="text-zinc-400">{grn?.status}</TableCell>
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
