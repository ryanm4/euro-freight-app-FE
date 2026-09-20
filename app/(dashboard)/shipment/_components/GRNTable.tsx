import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface PackingListSummary {
  id: number
  packing_list_no: string
  shipping_mode: string
  ship_to?: string
  total_cartons?: number
  total_quantity?: number
}

export interface GRNItem {
  id: number
  client_id: string | number
  manufacture_id: string | number
  forwarder_id: string | number
  recipient_name?: string
  recipient_contact_no?: string
  date?: string
  quantity?: number
  status?: string
  packing_lists?: PackingListSummary[]
  gdns?: any[]
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const d = new Date(value)
  if (isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function GRNTable({
  grns,
  selectedIds,
  onToggle,
  readOnly = false,
}: {
  grns: GRNItem[]
  selectedIds?: Set<number>
  onToggle?: (id: number) => void
  readOnly?: boolean
}) {
  // Extract active ship_to destinations from selected GRNs
  const selectedGrns = grns?.filter((g) => selectedIds?.has(g.id)) ?? []
  const activeShipTos: string[] = []
  selectedGrns.forEach((g) => {
    (g.packing_lists ?? []).forEach((pl) => {
      if (
        pl.ship_to &&
        pl.ship_to.trim() &&
        !activeShipTos.includes(pl.ship_to.trim())
      ) {
        activeShipTos.push(pl.ship_to.trim())
      }
    })
  })

  const headers = [
    "GRN No",
    "Client",
    "Manufacturer",
    "Forwarder",
    "Recipient",
    "Date",
    "Quantity",
    "Shipping Mode",
    "Ship To",
    "Status",
  ]
  if (!readOnly) headers.push("Actions")

  return (
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
        {grns?.length ? (
          grns.map((grn) => {
            const shippingModes =
              Array.from(
                new Set(
                  (grn.packing_lists ?? [])
                    .map((pl) => pl.shipping_mode)
                    .filter(Boolean)
                )
              ).join(", ") || "—"

            const shipTos =
              Array.from(
                new Set(
                  (grn.packing_lists ?? [])
                    .map((pl) => pl.ship_to?.trim())
                    .filter(Boolean)
                )
              ).join(", ") || "—"

            const grnShipTos = (grn.packing_lists ?? [])
              .map((pl) => pl.ship_to?.trim())
              .filter(Boolean) as string[]

            const isSelected = selectedIds?.has(grn.id) ?? false
            const isMismatch =
              activeShipTos.length > 0 &&
              !isSelected &&
              (grnShipTos.length === 0 ||
                !grnShipTos.some((st) =>
                  activeShipTos.some(
                    (ast) => ast.toLowerCase() === st.toLowerCase()
                  )
                ))

            const clientVal =
              typeof (grn as any).client === "object"
                ? (grn as any).client?.name
                : ((grn as any).client_name ?? (grn as any).client ?? grn.client_id ?? "—")

            const manufactureVal =
              typeof (grn as any).manufacture === "object"
                ? (grn as any).manufacture?.name
                : ((grn as any).manufacturer_name ?? (grn as any).manufacture ?? grn.manufacture_id ?? "—")

            const forwarderVal =
              typeof (grn as any).forwarder === "object"
                ? (grn as any).forwarder?.name
                : ((grn as any).forwarder_name ?? (grn as any).forwarder ?? grn.forwarder_id ?? "—")

            const recipientVal =
              typeof (grn as any).recipient === "object"
                ? (grn as any).recipient?.name
                : (grn.recipient_name ?? (grn as any).recipient_contact ?? (grn as any).recipient_id ?? "—")

            return (
              <TableRow
                key={grn.id}
                className={`border-neutral-800 ${
                  isMismatch
                    ? "opacity-50 hover:bg-transparent"
                    : "hover:bg-neutral-800/40"
                }`}
              >
                <TableCell className="text-sm font-medium text-zinc-100">
                  {`GRN-${grn.id}`}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {clientVal}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {manufactureVal}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {forwarderVal}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {recipientVal}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap text-zinc-300">
                  {formatDate(grn.date)}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {grn.quantity?.toLocaleString() ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {shippingModes !== "—" ? (
                    <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                      {shippingModes}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-sm text-zinc-300 font-medium">
                  {shipTos}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                    {grn.status ? String(grn.status).replaceAll("_", " ").toUpperCase() : "OPEN"}
                  </span>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <div
                      title={
                        isMismatch
                          ? `Cannot select: Ship To place (${
                              shipTos
                            }) does not match selected GRN Ship To (${activeShipTos.join(
                              ", "
                            )})`
                          : undefined
                      }
                    >
                      <Checkbox
                        checked={isSelected}
                        disabled={isMismatch}
                        onCheckedChange={() => {
                          if (!isMismatch) {
                            onToggle?.(grn.id)
                          }
                        }}
                        className="border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={readOnly ? 10 : 11}
              className="h-24 text-center text-sm text-zinc-500"
            >
              No GRN records found for this shipping mode.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
