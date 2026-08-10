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
    date ? format(new Date(date), "dd/MMM/yy HH:mm") : "N/A"

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
                      onClick={() => actions.onEdit(id)}
                    >
                      <IconPencil className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={() => actions.onDelete(id)}
                    >
                      <IconTrash className="h-4 w-4 text-destructive hover:text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )
      },
    },
  ]
}