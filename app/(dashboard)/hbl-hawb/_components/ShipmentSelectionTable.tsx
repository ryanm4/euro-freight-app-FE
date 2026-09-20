import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface ShipmentItem {
  id: number
  status?: string
  mbl_mawb_no?: string
  airline_shipping_line?: string
  vessel_name?: string
  voyage_number?: string
  flight_number?: string
  origin?: string
  destination?: string
  origin_port?: string
  discharge_port?: string
  etd_colombo?: string
  etd_origin?: string
  eta_discharge_port?: string
  eta_destination?: string
  grns?: any[]
}

export default function ShipmentSelectionTable({
  shipments,
  selectedIds,
  onToggle,
  readOnly = false,
}: {
  shipments: ShipmentItem[]
  selectedIds?: Set<number>
  onToggle?: (id: number) => void
  readOnly?: boolean
}) {
  const headers = [
    "Shipment ID",
    "MBL / MAWB No",
    "Airline / Shipping Line",
    "Vessel / Flight",
    "Voyage / Origin",
    "Port of Origin",
    "Destination",
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
        {shipments?.length ? (
          shipments.map((s) => {
            const vesselOrFlight = s.vessel_name || s.flight_number || "—"
            const voyageOrOrigin = s.voyage_number || s.origin || "—"
            const originPort = s.origin_port || s.origin || "—"
            const destination = s.discharge_port || s.destination || "—"
            const isSelected = selectedIds?.has(s.id) ?? false
            const isAnySelected = (selectedIds?.size ?? 0) > 0
            const isDisabled = isAnySelected && !isSelected

            return (
              <TableRow
                key={s.id}
                className="border-neutral-800 hover:bg-neutral-800/40"
              >
                <TableCell className="text-sm font-semibold text-zinc-100">
                  {`Shipment-${s.id}`}
                </TableCell>
                <TableCell className="text-sm text-zinc-300 font-medium">
                  {s.mbl_mawb_no || "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {s.airline_shipping_line || "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {vesselOrFlight}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {voyageOrOrigin}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {originPort}
                </TableCell>
                <TableCell className="text-sm text-zinc-300">
                  {destination}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/20 uppercase">
                    {s.status || "PLANNED"}
                  </span>
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => onToggle?.(s.id)}
                      className="border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    />
                  </TableCell>
                )}
              </TableRow>
            )
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={readOnly ? 8 : 9}
              className="h-24 text-center text-sm text-zinc-500"
            >
              No planned shipments found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
