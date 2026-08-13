"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GOODS_DELIVER_NOTE } from "@/modules/gdn/types"
import {
  IconArrowsSort,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

interface GoodsDeliverNoteTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const goodsDeliverNoteColumns = (
  actions: GoodsDeliverNoteTableActions,
  options?: { canModify?: boolean }
): ColumnDef<GOODS_DELIVER_NOTE>[] => {
  const canModify = options?.canModify ?? true

  return [
    {
      accessorKey: "gdn_no",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GDN No
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">{row.original.gdn_no ?? "N/A"}</div>
      ),
    },
    {
      id: "packing_list_no",
      header: "Packing List No(s)",
      cell: ({ row }) => {
        const router = useRouter()
        const packingLists = row.original.packing_lists ?? []

        if (packingLists.length === 0) {
          return <div>N/A</div>
        }

        return (
          <div className="flex flex-wrap gap-1">
            {packingLists.map((pl) => {
              const label = pl.packing_list_no ?? `PL-${pl.id}`
              return (
                <button
                  key={pl.id}
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/packing-list/${pl.id}`)
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )
      },
    },
    {
      accessorKey: "forwarder_name",
      header: "Forwarder",
      cell: ({ row }) => <div>{row.original.forwarder_name ?? "N/A"}</div>,
    },
    {
      accessorKey: "transport_mode",
      header: "Cargo Transport Mode",
      cell: ({ row }) => <div>{row.original.transport_mode ?? "N/A"}</div>,
    },
    {
      id: "total_quantity",
      header: "Total Quantity",
      cell: ({ row }) => {
        const value =
          row.original.actual_cartoons ?? row.original.cartoons ?? "N/A"
        return <div>{value}</div>
      },
    },
    {
      id: "total_weight",
      header: "Total Weight",
      cell: ({ row }) => {
        const value =
          row.original.actual_gross_weight ?? row.original.gross_weight ?? "N/A"
        return <div>{value}</div>
      },
    },
    {
      id: "total_volume",
      header: "Total Volume",
      cell: ({ row }) => {
        const value =
          row.original.actual_gross_volume ?? row.original.gross_volume ?? "N/A"
        return <div>{value}</div>
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Dispatch Date
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.original.date
        return date ? format(new Date(date), "dd/MMM/yy HH:mm") : "N/A"
      },
    },
    {
      accessorKey: "vehicle_no",
      header: "Vehicle No",
      cell: ({ row }) => <div>{row.original.vehicle_no ?? "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status?.replaceAll("_", " ").toUpperCase() || "N/A"} type="GDN" />
      ),
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