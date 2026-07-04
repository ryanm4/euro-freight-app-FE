import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface HBL {
  id: number
  client_id: string
  manufacture_id: string
  date: string
  type: string
  house_bl_no: string | null
  mbl_mawb_no: string | null
  etd: string | null
  eta: string | null
  arrival_port: string | null
  no_pieces: number
  status: string
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

export default function HBLTable({
  hbls,
  selectedIds,
  onToggle,
  readOnly = false,
}: {
  hbls: HBL[]
  selectedIds?: Set<number>
  onToggle?: (id: number) => void
  readOnly?: boolean
}) {
  const headers = [
    "HBL No",
    "Client",
    "Manufacturer",
    "Type",
    "MBL/MAWB No",
    "ETD",
    "ETA",
    "Arrival Port",
    "Pieces",
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
        {hbls?.length ? (
          hbls.map((hbl) => (
            <TableRow
              key={hbl.id}
              className="border-neutral-800 hover:bg-neutral-800/40"
            >
              <TableCell className="text-sm text-zinc-100">
                {hbl.house_bl_no ?? `HBL-${hbl.id}`}
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {hbl.client_id}
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {hbl.manufacture_id}
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {hbl.type}
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {hbl.mbl_mawb_no ?? "—"}
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap text-zinc-300">
                {formatDate(hbl.etd)}
              </TableCell>
              <TableCell className="text-sm whitespace-nowrap text-zinc-300">
                {formatDate(hbl.eta)}
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {hbl.arrival_port ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-zinc-300">
                {hbl.no_pieces?.toLocaleString() ?? "—"}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs font-medium text-yellow-400">
                  {hbl.status}
                </span>
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <Checkbox
                    checked={selectedIds?.has(hbl.id) ?? false}
                    onCheckedChange={() => onToggle?.(hbl.id)}
                    className="border-neutral-600"
                  />
                </TableCell>
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={readOnly ? 10 : 11}
              className="h-24 text-center text-sm text-zinc-500"
            >
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
