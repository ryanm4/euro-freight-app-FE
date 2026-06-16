"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GOODS_DELIVER_NOTE } from "@/modules/gdn/types"
import {
  IconArrowsSort,
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

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
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">#{row.original.id}</div>
      ),
    },
    {
      accessorKey: "client_id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client ID
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.original.client_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "manufacture_id",
      header: "Manufacturer ID",
      cell: ({ row }) => <div>{row.original.manufacture_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "forwarder_id",
      header: "Forwarder ID",
      cell: ({ row }) => <div>{row.original.forwarder_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.date
        return date ? format(new Date(date), "PPP p") : "N/A"
      },
    },
    {
      accessorKey: "cartoons",
      header: "Cartons",
      cell: ({ row }) => <div>{row.original.cartoons ?? "N/A"}</div>,
    },
    {
      accessorKey: "actual_cartoons",
      header: "Actual Cartons",
      cell: ({ row }) => <div>{row.original.actual_cartoons ?? "N/A"}</div>,
    },
    {
      accessorKey: "gross_weight",
      header: "Gross Weight",
      cell: ({ row }) => <div>{row.original.gross_weight ?? "N/A"}</div>,
    },
    {
      accessorKey: "actual_gross_weight",
      header: "Actual Gross Weight",
      cell: ({ row }) => <div>{row.original.actual_gross_weight ?? "N/A"}</div>,
    },
    {
      accessorKey: "gross_volume",
      header: "Gross Volume",
      cell: ({ row }) => <div>{row.original.gross_volume ?? "N/A"}</div>,
    },
    {
      accessorKey: "actual_gross_volume",
      header: "Actual Gross Volume",
      cell: ({ row }) => <div>{row.original.actual_gross_volume ?? "N/A"}</div>,
    },
    {
      accessorKey: "gdn_grn_ref",
      header: "GDN/GRN Ref",
      cell: ({ row }) => <div>{row.original.gdn_grn_ref ?? "N/A"}</div>,
    },
    {
      accessorKey: "vehicle_no",
      header: "Vehicle No",
      cell: ({ row }) => <div>{row.original.vehicle_no ?? "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              status === "active"
                ? "bg-green-500/10 text-green-400"
                : status === "inactive"
                  ? "bg-red-500/10 text-red-400"
                  : status === "pending"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-neutral-500/10 text-neutral-400"
            }`}
          >
            {status ?? "N/A"}
          </span>
        )
      },
    },
    {
      accessorKey: "created_by",
      header: "Created By",
      cell: ({ row }) => <div>{row.original.created_by ?? "N/A"}</div>,
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => {
        const date = row.original.created_on
        return date ? format(new Date(date), "PPP p") : "N/A"
      },
    },
    {
      accessorKey: "updated_by",
      header: "Updated By",
      cell: ({ row }) => <div>{row.original.updated_by ?? "N/A"}</div>,
    },
    {
      accessorKey: "updated_on",
      header: "Updated On",
      cell: ({ row }) => {
        const date = row.original.updated_on
        return date ? format(new Date(date), "PPP p") : "N/A"
      },
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