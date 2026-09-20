"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SHIPMENT } from "@/modules/shipment/types"
import {
  IconArrowsSort,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

interface ShipmentTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

type ShipmentMode = "AIR" | "FCL" | "LCL" | null

// The shipment record doesn't carry its own mode/type field — it's inferred
// from the first HBL's `type`, falling back to which shipment-level fields
// are populated (useful for shipments with no HBLs attached yet).
const getShipmentMode = (row: SHIPMENT): ShipmentMode => {
  const hblType = row.hbls?.[0]?.type
  if (hblType === "AIR" || hblType === "FCL" || hblType === "LCL") {
    return hblType
  }
  if (row.flight_number || row.origin || row.destination) return "AIR"
  if (row.container_number) return "FCL"
  if (row.vessel_name || row.voyage_number || row.origin_port) return "LCL"
  return null
}

export const shipmentColumns = (
  actions: ShipmentTableActions,
  options?: { canModify?: boolean }
): ColumnDef<SHIPMENT>[] => {
  const canModify = options?.canModify ?? true

  const formatDate = (date?: string | null) =>
    date ? format(new Date(date), "dd/MMM/yy") : "N/A"

  // Ocean and air shipments store origin/destination/ETD/ETA under
  // different keys. These normalize them for a single table view.
  const getOriginPort = (row: SHIPMENT) => row.origin_port ?? row.origin
  const getDestinationPort = (row: SHIPMENT) =>
    row.discharge_port ?? row.destination
  const getEtd = (row: SHIPMENT) => row.etd_colombo ?? row.etd_origin
  const getEta = (row: SHIPMENT) =>
    row.eta_final_delivery_place ??
    row.eta_discharge_port ??
    row.eta_destination

  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Shipment ID <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">Shipment-{row.original.id}</div>
      ),
    },
    {
      accessorKey: "mbl_mawb_no",
      header: "MBL / MAWB No",
      cell: ({ row }) => <div>{row.original.mbl_mawb_no || "N/A"}</div>,
    },
    {
      id: "grn_no",
      header: "GRN #",
      cell: ({ row }) => {
        const rawGrns = (row.original as any).grns ?? (row.original as any).grn_details
        let grnList: { id: number | string }[] = []

        if (Array.isArray(rawGrns) && rawGrns.length > 0) {
          grnList = rawGrns.map((g: any) =>
            typeof g === "object" ? { id: g.id } : { id: g }
          )
        } else {
          const rawIds = (row.original as any).grn_ids
          if (Array.isArray(rawIds) && rawIds.length > 0) {
            grnList = rawIds.map((id: any) => ({ id }))
          }
        }

        if (grnList.length === 0) {
          return <div className="text-zinc-500">—</div>
        }

        return (
          <div className="flex flex-wrap items-center gap-1 font-medium">
            {grnList.map((g, idx) => (
              <span key={g.id}>
                <Link
                  href={`/grn/${g.id}`}
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  GRN-{g.id}
                </Link>
                {idx < grnList.length - 1 && <span className="text-zinc-400">,</span>}
              </span>
            ))}
          </div>
        )
      },
    },
    {
      id: "vessel_voyage",
      header: "Vessel Name / Voyage No",
      cell: ({ row }) => {
        const { vessel_name, voyage_number } = row.original
        if (!vessel_name && !voyage_number) return <div>N/A</div>
        return (
          <div>
            <div>{vessel_name || "N/A"}</div>
            {voyage_number && (
              <div className="text-xs text-zinc-500">{voyage_number}</div>
            )}
          </div>
        )
      },
    },
    {
      id: "origin_port",
      header: "Port of Origin",
      cell: ({ row }) => <div>{getOriginPort(row.original) || "N/A"}</div>,
    },
    {
      id: "destination_port",
      header: "Port of Destination",
      cell: ({ row }) => <div>{getDestinationPort(row.original) || "N/A"}</div>,
    },
    {
      accessorKey: "final_place_of_delivery",
      header: "Final Delivery Location",
      cell: ({ row }) => (
        <div>{row.original.final_place_of_delivery || "N/A"}</div>
      ),
    },
    {
      accessorKey: "airline_shipping_line",
      header: "Airline / Shipping Line",
      cell: ({ row }) => (
        <div>{row.original.airline_shipping_line || "N/A"}</div>
      ),
    },
    {
      id: "shipment_type",
      header: "Type",
      cell: ({ row }) => {
        const mode = getShipmentMode(row.original)
        return mode ? (
          <StatusBadge status={mode} type="SHIPMENT" />
        ) : (
          <div>N/A</div>
        )
      },
    },
    {
      id: "container_number",
      header: "Container Number",
      cell: ({ row }) =>
        getShipmentMode(row.original) === "FCL" ? (
          <div>{row.original.container_number || "N/A"}</div>
        ) : (
          <div className="text-zinc-600">—</div>
        ),
    },
    {
      id: "container_size",
      header: "Container Size",
      cell: ({ row }) =>
        getShipmentMode(row.original) === "FCL" ? (
          <div>{row.original.container_size || "N/A"}</div>
        ) : (
          <div className="text-zinc-600">—</div>
        ),
    },
    {
      id: "final_seal_no",
      header: "Final Seal No",
      cell: ({ row }) =>
        getShipmentMode(row.original) === "FCL" ? (
          <div>{row.original.final_seal_no || "N/A"}</div>
        ) : (
          <div className="text-zinc-600">—</div>
        ),
    },
    {
      id: "etd",
      header: "ETD",
      cell: ({ row }) => formatDate(getEtd(row.original)),
    },
    {
      id: "eta",
      header: "ETA",
      cell: ({ row }) => formatDate(getEta(row.original)),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status || "N/A"} type="SHIPMENT" />
      ),
    },
    {
      accessorKey: "created_by",
      header: "Created By",
      cell: ({ row }) => <div>{row.original.created_by ?? "N/A"}</div>,
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => formatDate(row.original.created_on),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = String(row.original.id)
        const status = row.original.status?.trim().toLowerCase()
        const canModifyRow = canModify && (status === "planned" || status === "draft")

        return (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  onClick={() => actions.onView(id)}
                >
                  <IconEye className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View</TooltipContent>
            </Tooltip>

            {canModify && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      disabled={!canModifyRow}
                      onClick={() => actions.onEdit(id)}
                    >
                      <IconPencil className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canModifyRow ? "Edit" : "Editing not allowed unless status is Planned"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      disabled={!canModifyRow}
                      onClick={() => actions.onDelete(id)}
                    >
                      <IconTrash className="h-4 w-4 text-destructive hover:text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canModifyRow ? "Delete" : "Deleting not allowed unless status is Planned"}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )
      },
    },
  ]
}