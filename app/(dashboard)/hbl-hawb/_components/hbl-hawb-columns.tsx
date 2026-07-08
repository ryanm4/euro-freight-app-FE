"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HBL_HAWB } from "@/modules/hbl-hawb/types"
import {
  IconArrowsSort,
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface HBLHAWBTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const hblHawbColumns = (
  actions: HBLHAWBTableActions,
  options?: { canModify?: boolean }
): ColumnDef<HBL_HAWB>[] => {
  const canModify = options?.canModify ?? true

  const formatDate = (date?: string | null) =>
    date ? format(new Date(date), "PPP") : "N/A"

  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">#{row.original.id}</div>
      ),
    },
    {
      accessorKey: "mbl_mawb_no",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MBL/MAWB No <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">{row.original.mbl_mawb_no ?? "N/A"}</div>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Client",
      cell: ({ row }) => <div>{row.original.client_name ?? "N/A"}</div>,
    },
    {
      accessorKey: "manufacture_id",
      header: "Manufacturer ID",
      cell: ({ row }) => <div>{row.original.manufacture_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => <div>{row.original.type ?? "N/A"}</div>,
    },
    {
      accessorKey: "shipment_id",
      header: "Shipment ID",
      // cell: ({ row }) => <div>{row.original.shipment_id ?? "N/A"}</div>,
      cell: ({ row }) => {
        const router = useRouter()
        const ref = row.original.shipment_id ?? "N/A"

        return (
          <button
            type="button"
            className="text-primary underline-offset-4 hover:underline"
            onClick={(e) => {
              e.stopPropagation() // prevents any row-level click handler from also firing
              router.push(`/grn/${ref}`)
            }}
          >
            {ref}
          </button>
        )
      },
    },
    {
      accessorKey: "planned_vessel_name",
      header: "Vessel Name",
      cell: ({ row }) => <div>{row.original.planned_vessel_name ?? "N/A"}</div>,
    },
    {
      accessorKey: "voyage_no",
      header: "Voyage No",
      cell: ({ row }) => <div>{row.original.voyage_no ?? "N/A"}</div>,
    },
    {
      accessorKey: "etd",
      header: "ETD",
      cell: ({ row }) => formatDate(row.original.etd),
    },
    {
      accessorKey: "eta",
      header: "ETA",
      cell: ({ row }) => formatDate(row.original.eta),
    },
    {
      accessorKey: "actual_etd",
      header: "Actual ETD",
      cell: ({ row }) => formatDate(row.original.actual_etd),
    },
    {
      accessorKey: "actual_eta",
      header: "Actual ETA",
      cell: ({ row }) => formatDate(row.original.actual_eta),
    },
    {
      accessorKey: "arrival_port",
      header: "Arrival Port",
      cell: ({ row }) => <div>{row.original.arrival_port ?? "N/A"}</div>,
    },
    {
      accessorKey: "inland_location",
      header: "Inland Location",
      cell: ({ row }) => <div>{row.original.inland_location ?? "N/A"}</div>,
    },
    {
      accessorKey: "no_pieces",
      header: "Pieces",
      cell: ({ row }) => <div>{row.original.no_pieces ?? "N/A"}</div>,
    },
    {
      accessorKey: "gross_weight",
      header: "Gross Weight",
      cell: ({ row }) => <div>{row.original.gross_weight ?? "N/A"}</div>,
    },
    {
      accessorKey: "chargeable_weight",
      header: "Chargeable Weight",
      cell: ({ row }) => <div>{row.original.chargeable_weight ?? "N/A"}</div>,
    },
    {
      accessorKey: "cbm",
      header: "CBM",
      cell: ({ row }) => <div>{row.original.cbm ?? "N/A"}</div>,
    },
    {
      accessorKey: "container_seal_no",
      header: "Container/Seal No",
      cell: ({ row }) => <div>{row.original.container_seal_no ?? "N/A"}</div>,
    },
    {
      accessorKey: "onboard_date",
      header: "Onboard Date",
      cell: ({ row }) => formatDate(row.original.onboard_date),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status || "N/A"} type="HBL_HAWB" />
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
      accessorKey: "updated_by",
      header: "Updated By",
      cell: ({ row }) => <div>{row.original.updated_by ?? "N/A"}</div>,
    },
    {
      accessorKey: "updated_on",
      header: "Updated On",
      cell: ({ row }) => formatDate(row.original.updated_on),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = String(row.original.id)
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <IconDots />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canModify && (
                <>
                  <DropdownMenuItem onClick={() => actions.onEdit(id)}>
                    <IconPencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.onDelete(id)}
                  >
                    <IconTrash className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => actions.onView(id)}>
                <IconEye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
