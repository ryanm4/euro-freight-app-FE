"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PACKING_LIST } from "@/modules/packing-list/types"
import {
  IconArrowsSort,
  IconDots,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface PackingListTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const packingListColumns = (
  actions: PackingListTableActions,
  options?: { canModify?: boolean }
): ColumnDef<PACKING_LIST>[] => {
  const canModify = options?.canModify ?? true

  return [
    {
      accessorKey: "packing_list_no",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Packing List Number
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "po_number",
      accessorFn: (row) =>
        row.purchase_orders?.map((po) => po.po_number).join(", ") || "-",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PO Number
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
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
      accessorKey: "client_name",
      header: "Client Name",
    },

    {
      accessorKey: "total_quantity",
      header: "Quantity",
    },
    // {
    //   accessorKey: "quantity",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       Actual Quantity
    //       <IconArrowsSort className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => <div>{row.original.quantity ?? "N/A"}</div>,
    // },
    {
      accessorKey: "shipping_mode",
      header: "Shipping Mode",
    },

    {
      accessorKey: "total_net_weight_kg",
      header: "Total Weight",
    },
    {
      accessorKey: "total_volume",
      header: "Total volume",
    },
    {
      accessorKey: "gdn_id",
      header: "GDN Number",
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = String(row.original.packing_list_id)

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
