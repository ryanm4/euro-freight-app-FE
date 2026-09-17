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
  total_cartons: number
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
  gdns: any
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
  selectedType,
}: {
  grns: GRN[]
  selectedIds?: Set<number>
  onToggle?: (id: number) => void
  readOnly?: boolean
  selectedType?: string
}) {  

  const headers = [
    "GRN No",
    "Client",
    "Manufacturer",
    "Total Cartoon Count",
    "Total Gross Weight",
    "Total Volume",
    "GRN Date ",
    "Shipping Mode",
    "Status",
  ]
  if (!readOnly) headers.push("Actions")

  const columnCount = headers.length

  const normalize = (val?: string | null) => (val ?? "").trim().toUpperCase()

  const isGrnDisabled = (grn: GRN) => {
    if (readOnly) return false
    if (!selectedType) return false // no type chosen yet -> don't restrict

    const target = normalize(selectedType)
    
    const modes =
      grn.packing_lists?.map((pl) =>
        normalize(
          pl.shipping_mode === "LCL" || pl.shipping_mode === "FCL"
            ? "SEA"
            : pl.shipping_mode
        )
      ) ?? []

    // No packing list data to check against -> treat as disabled (unknown mode)
    if (modes.length === 0) return true

    // Enabled only if at least one packing list matches the selected type
    return !modes.includes(target)
  }

  const totalCartons = (grn: GRN) =>
    grn.packing_lists?.reduce((sum, pl) => sum + pl.total_cartons, 0) ?? 0

  const shippingMode = (grn: GRN) => {
    const modes = grn.packing_lists?.map((pl) => pl.shipping_mode) ?? []
    return modes.length > 0
      ? modes.map((m) => (m === "FCL" || m === "LCL" ? "Sea" : m)).join(", ")
      : "N/A"
  }

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
          {grns.map((grn, i) => {
            const disabled = isGrnDisabled(grn)
            return (
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
                  {`GRN-${grn.id}`}
                </TableCell>
                <TableCell className="text-zinc-200">{grn.client_id}</TableCell>
                <TableCell className="text-zinc-300">
                  {grn.manufacture_id}
                </TableCell>
                <TableCell className="text-zinc-300">
                  {totalCartons(grn).toLocaleString()}
                </TableCell>
                <TableCell className="text-zinc-300">
                  {grn?.gdns[0].weight.toLocaleString()} kg
                </TableCell>
                <TableCell className="text-zinc-300">
                  {grn?.gdns[0].volume.toLocaleString()}
                </TableCell>
                <TableCell className="whitespace-nowrap text-zinc-300">
                  {format(new Date(grn.date), "dd/MMM/yy")}
                </TableCell>
                <TableCell className="text-zinc-300">
                  {shippingMode(grn)}
                </TableCell>
                <TableCell className="text-zinc-400">{grn?.status}</TableCell>
                {!readOnly && (
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <input
                              type="checkbox"
                              checked={selectedIds?.has(grn.id) ?? false}
                              onChange={() => onToggle?.(grn.id)}
                              disabled={disabled}
                              className="h-3.5 w-3.5 rounded border-neutral-600 accent-zinc-400 disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </span>
                        </TooltipTrigger>
                        {disabled && (
                          <TooltipContent side="top">
                            Shipping mode doesn&apos;t match selected type
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
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
