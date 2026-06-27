"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import {
  IconArrowsSort,
  IconDots,
  IconEye,
  IconLink,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface PurchaseOrderTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const purchaseOrderColumns = (
  actions: PurchaseOrderTableActions,
  options?: { canModify?: boolean }
): ColumnDef<PURCHASE_ORDER>[] => {
  const canModify = options?.canModify ?? true

  const formatDate = (date?: string | null) =>
    date ? format(new Date(date), "PPP") : "N/A"

  return [
    // {
    //   accessorKey: "id",
    //   header: ({ column }) => (
    //     <Button
    //       variant="ghost"
    //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //     >
    //       ID <IconArrowsSort className="ml-2 h-4 w-4" />
    //     </Button>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="font-semibold">#{row.original.id}</div>
    //   ),
    // },
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
        <div className="font-semibold">{row.original.po_number ?? "N/A"}</div>
      ),
    },
    {
      accessorKey: "po_quantity",
      header: "PO Qty",
      cell: ({ row }) => <div>{row.original.po_quantity ?? "N/A"}</div>,
    },
    {
      accessorKey: "supplier_id",
      header: "Supplier ID",
      cell: ({ row }) => <div>{row.original.supplier_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "freight_forwarder",
      header: "Freight Forwarder",
      cell: ({ row }) => <div>{row.original.freight_forwarder ?? "N/A"}</div>,
    },
    {
      accessorKey: "shipping_mode",
      header: "Shipping Mode",
      cell: ({ row }) => <div>{row.original.shipping_mode ?? "N/A"}</div>,
    },
    // {
    //   accessorKey: "payment_mode",
    //   header: "Payment Mode",
    //   cell: ({ row }) => <div>{row.original.payment_mode ?? "N/A"}</div>,
    // },
    // {
    //   accessorKey: "final_destination",
    //   header: "Final Destination",
    //   cell: ({ row }) => <div>{row.original.final_destination ?? "N/A"}</div>,
    // },
    {
      accessorKey: "ex_factory_date",
      header: "Ex-Factory Date",
      cell: ({ row }) => formatDate(row.original.ex_factory_date),
    },
    // {
    //   accessorKey: "cargo_dispatch_date",
    //   header: "Cargo Dispatch Date",
    //   cell: ({ row }) => formatDate(row.original.cargo_dispatch_date),
    // },
    {
      accessorKey: "dc_inhouse_date",
      header: "DC Inhouse Date",
      cell: ({ row }) => formatDate(row.original.dc_inhouse_date),
    },
    {
      accessorKey: "eta_dest",
      header: "ETA Destination",
      cell: ({ row }) => <div>{row.original.eta_dest ?? "N/A"}</div>,
    },
    {
      accessorKey: "hbl_no",
      header: "HBL No",
      cell: ({ row }) => <div>{row.original.hbl_no ?? "N/A"}</div>,
    },
    {
      accessorKey: "packing_list_id",
      header: "Packing List ID",
      cell: ({ row }) => <div>{row.original.packing_list_id ?? "N/A"}</div>,
    },
    // {
    //   accessorKey: "instructions",
    //   header: "Instructions",
    //   cell: ({ row }) => <div>{row.original.instructions ?? "N/A"}</div>,
    // },
    // {
    //   accessorKey: "PO_url",
    //   header: "PO Document",
    //   cell: ({ row }) => {
    //     const url = row.original.PO_url
    //     if (!url) return <span className="text-zinc-500">N/A</span>
    //     return (
    //       <a
    //         href={url}
    //         target="_blank"
    //         rel="noopener noreferrer"
    //         className="inline-flex items-center text-blue-400 hover:underline"
    //       >
    //         <IconLink className="mr-1 h-4 w-4" /> View
    //       </a>
    //     )
    //   },
    // },
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
    // {
    //   accessorKey: "created_by",
    //   header: "Created By",
    //   cell: ({ row }) => <div>{row.original.created_by ?? "N/A"}</div>,
    // },
    // {
    //   accessorKey: "created_on",
    //   header: "Created On",
    //   cell: ({ row }) => formatDate(row.original.created_on),
    // },
    // {
    //   accessorKey: "updated_by",
    //   header: "Updated By",
    //   cell: ({ row }) => <div>{row.original.updated_by ?? "N/A"}</div>,
    // },
    // {
    //   accessorKey: "updated_on",
    //   header: "Updated On",
    //   cell: ({ row }) => formatDate(row.original.updated_on),
    // },
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
                    <IconPencil className="mr-2 h-4 w-4" /> Edit Purchase Order
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => actions.onDelete(id)}
                  >
                    <IconTrash className="mr-2 h-4 w-4" /> Delete Purchase Order
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={() => actions.onView(id)}>
                <IconEye className="mr-2 h-4 w-4" /> View Purchase Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
