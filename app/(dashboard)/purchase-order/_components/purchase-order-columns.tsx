"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import {
  IconArrowsSort,
  IconCloudDownload,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface PurchaseOrderTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
  onDownload: (filePath: string | null) => void
}

export const purchaseOrderColumns = (
  actions: PurchaseOrderTableActions,
  options?: { canModify?: boolean }
): ColumnDef<PURCHASE_ORDER>[] => {
  const canModify = options?.canModify ?? true

  const formatDate = (date?: string | null) =>
    date ? format(new Date(date), "dd/MMM/yy HH:mm") : "N/A"

  return [
    {
      accessorKey: "po_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          PO Number <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">{row.original?.poNumber ?? "N/A"}</div>
      ),
    },
    {
      accessorKey: "po_quantity",
      header: "PO Qty",
      cell: ({ row }) => <div>{row.original?.totalQty ?? "N/A"}</div>,
    },
    {
      accessorKey: "supplier_id",
      header: "Supplier ID",
      cell: ({ row }) => <div>{row.original?.vendor ?? "N/A"}</div>,
    },
    {
      accessorKey: "ex_factory_date",
      header: "Ex-Factory Date",
      cell: ({ row }) => formatDate(row.original.ex_factory_date),
    },
    {
      accessorKey: "dc_inhouse_date",
      header: "DC Inhouse Date",
      cell: ({ row }) => formatDate(row.original.dc_in_house_date),
    },
    {
      accessorKey: "eta_dest",
      header: "ETA Destination",
      cell: ({ row }) => <div>{row.original.shipTo ?? "N/A"}</div>,
    },
    {
      accessorKey: "hbl_no",
      header: "HBL No",
      cell: ({ row }) => <div>{row.original.hbl_nos ?? "N/A"}</div>,
    },
    {
      accessorKey: "packing_list_id",
      header: "Packing List ID",
      cell: ({ row }) => <div>{row.original.packing_list_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status || "N/A"}
          type="PURCHASE_ORDER"
        />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        console.log("row", row?.original?.filePath)

        const id = String(row.original.id)

        return (
          <div className="flex items-center gap-1">
            {/* View */}
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
              <TooltipContent>View Purchase Order</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0"
                  onClick={() =>
                    actions.onDownload(row?.original?.filePath ?? null)
                  }
                >
                  <IconCloudDownload className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download Purchase Order</TooltipContent>
            </Tooltip>

            {canModify && (
              <>
                {/* Edit */}
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
                  <TooltipContent>Edit Purchase Order</TooltipContent>
                </Tooltip>

                {/* Delete */}
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
                  <TooltipContent>Delete Purchase Order</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )
      },
    },
  ]
}
