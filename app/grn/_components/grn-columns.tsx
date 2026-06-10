"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GRN } from "@/modules/grn/types"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowsSort, IconEye, IconDots, IconPencil, IconTrash } from "@tabler/icons-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"

interface GRNTableActions {
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onView: (id: string) => void
}

export const grnColumns = (
    actions: GRNTableActions,
    options?: { canModify?: boolean }
): ColumnDef<GRN>[] => {
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "client_id",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        Client ID <IconArrowsSort className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-semibold">{row.original.client_id}</div>,
        },
        { accessorKey: "manufacture_id", header: "Manufacture ID" },
        { accessorKey: "forwarder_id", header: "Forwarder ID" },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const date = row.original.date
                return date ? format(new Date(date), "PPP p") : "N/A"
            }
        },
        { accessorKey: "quantity", header: "Quantity" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status || "N/A"} type="GRN" />
        },
        { accessorKey: "created_by", header: "Created By" },
        {
            accessorKey: "packing_list_ids",
            header: "Packing List IDs",
            cell: ({ row }) => <div>{row.original.packing_list_ids?.join(", ")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original
                const id = String(item.client_id) 
                
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
                                    <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(id)}>
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
    ];
};
