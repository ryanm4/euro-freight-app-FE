"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowsSort, IconEye, IconDots, IconPencil, IconTrash, IconLink } from "@tabler/icons-react"
import { StatusBadge } from "@/components/shared/status-badge"
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
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "po_number",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        PO Number
                        <IconArrowsSort className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="font-semibold">{row.original.po_number}</div>
            ),
        },
        {
            accessorKey: "po_quantity",
            header: "PO Qty",
            cell: ({ row }) => <div>{row.original.po_quantity}</div>,
        },
        {
            accessorKey: "ex_factory_date",
            header: "Ex-Factory Date",
            cell: ({ row }) => {
                const date = row.original.ex_factory_date
                return date ? format(new Date(date), "PPP") : "N/A"
            }
        },
        {
            accessorKey: "shipping_mode",
            header: "Shipping Mode",
            cell: ({ row }) => <div>{row.original.shipping_mode}</div>,
        },
        {
            accessorKey: "final_destination",
            header: "Final Destination",
            cell: ({ row }) => <div>{row.original.final_destination}</div>,
        },
        {
            accessorKey: "payment_mode",
            header: "Payment Mode",
            cell: ({ row }) => <div>{row.original.payment_mode}</div>,
        },
        {
            accessorKey: "actual_delivery_date",
            header: "Actual Delivery Date",
            cell: ({ row }) => {
                const date = row.original.actual_delivery_date
                return date ? format(new Date(date), "PPP") : "N/A"
            }
        },
        {
            accessorKey: "PO_url",
            header: "PO URL",
            cell: ({ row }) => {
                const url = row.original.PO_url;
                if (!url) return <span>N/A</span>;
                return (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline inline-flex items-center">
                        <IconLink className="mr-1 h-4 w-4" /> View
                    </a>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <StatusBadge status={status || "N/A"} type="PURCHASE_ORDER" />
                )
            },
        },
        {
            accessorKey: "created_by",
            header: "Created By",
            cell: ({ row }) => <div>{row.original.created_by}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const po = row.original
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
                                    <DropdownMenuItem
                                        onClick={() => actions.onEdit(po.po_number)}
                                    >
                                        <IconPencil className="mr-2 h-4 w-4" />
                                        Edit PO
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={() => actions.onDelete(po.po_number)}
                                    >
                                        <IconTrash className="mr-2 h-4 w-4" />
                                        Delete PO
                                    </DropdownMenuItem>
                                </>
                            )}
                            <DropdownMenuItem
                                onClick={() => actions.onView(po.po_number)}
                            >
                                <IconEye className="mr-2 h-4 w-4" />
                                View PO
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ];
};
