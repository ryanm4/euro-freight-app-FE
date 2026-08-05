"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PACKING_LIST } from "@/modules/packing-list/types"
import {
  IconArrowsSort,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

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
      cell: ({ row }) => {
        const poNumbers =
          row.original.purchase_orders?.map((po) => po.po_number) || []
        const visibleValue = poNumbers.slice(0, 2).join(", ") || "-"
        const fullValue = poNumbers.join(", ") || "-"

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                {poNumbers.length > 2 ? `${visibleValue}, ...` : visibleValue}
              </div>
            </TooltipTrigger>
            <TooltipContent>{fullValue}</TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.original.date
        return date ? format(new Date(date), "dd/MMM/yy HH:mm") : "N/A"
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status
        return <StatusBadge status={status || "N/A"} type="PACKING_LIST" />
      },
    },
    {
      accessorKey: "gdn_no",
      header: "GDN Number",
      cell: ({ row }) => {
        const gdnId = row.original.gdn_id
        const gdnNo = row.original.gdn_no

        if (!gdnId) return "-"

        return (
          <Link
            href={`/gdn/${gdnId}`}
            className="text-primary underline-offset-4 hover:underline"
          >
            {gdnNo || gdnId}
          </Link>
        )
      },
    },

    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = String(row.original.packing_list_id)

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
