"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GOODS_RECEIVE_NOTE } from "@/modules/grn/types"
import {
  IconArrowsSort,
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface GoodsReceiveNoteTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const goodsReceiveNoteColumns = (
  actions: GoodsReceiveNoteTableActions,
  options?: { canModify?: boolean }
): ColumnDef<GOODS_RECEIVE_NOTE>[] => {
  const canModify = options?.canModify ?? true

  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GDN Number
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">#{row.original.id}</div>
      ),
    },
    {
      accessorKey: "client_id",
      header: "Customer",
      cell: ({ row }) => <div>{row.original.client_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "manufacture_id",
      header: "Manufacturer",
      cell: ({ row }) => <div>{row.original.manufacture_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "date",
      header: "Received Date",
      cell: ({ row }) => {
        const date = row.original.date
        return date ? format(new Date(date), "PPP p") : "N/A"
      },
    },
    {
      accessorKey: "total_gdn_carton_count",
      header: "Total GDN Carton Count",
      cell: ({ row }) => {
        const total = row.original.packing_lists?.reduce(
          (sum, packingList) => sum + (packingList.total_quantity ?? 0),
          0
        )

        return <div>{total ?? "N/A"}</div>
      },
    },
    {
      accessorKey: "quantity",
      header: "Actual Carton Received",
      cell: ({ row }) => <div>{row.original.quantity ?? "N/A"}</div>,
    },
    {
      accessorKey: "shipping_mode",
      header: "Shipping Mode",
      cell: ({ row }) => {
        return (
          <div>{row.original.packing_lists?.[0]?.shipping_mode ?? "N/A"}</div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status || "N/A"} type="GRN" />
      ),
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
