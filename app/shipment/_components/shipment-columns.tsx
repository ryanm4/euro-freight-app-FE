"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SHIPMENT } from "@/modules/shipment/types"
import {
  IconArrowsSort,
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface ShipmentTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const shipmentColumns = (
  actions: ShipmentTableActions,
  options?: { canModify?: boolean }
): ColumnDef<SHIPMENT>[] => {
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
      accessorKey: "vessel_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vessel Name <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.original.vessel_name ?? "N/A"}</div>,
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