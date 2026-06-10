"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GDN } from "@/modules/gdn/types"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowsSort, IconEye, IconDots, IconPencil, IconTrash } from "@tabler/icons-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"

interface GDNTableActions {
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onView: (id: string) => void
}

export const gdnColumns = (
    actions: GDNTableActions,
    options?: { canModify?: boolean }
): ColumnDef<GDN>[] => {
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "gdn_grn_ref",
            header: ({ column }) => {
                return (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                        GDN Ref <IconArrowsSort className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="font-semibold">{row.original.gdn_grn_ref}</div>,
        },
        { accessorKey: "client_id", header: "Client ID" },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const date = row.original.date
                return date ? format(new Date(date), "PPP p") : "N/A"
            }
        },
        { accessorKey: "cartoons", header: "Cartoons" },
        { accessorKey: "actual_cartoons", header: "Actual Cartoons" },
        { accessorKey: "gross_weight", header: "Gross Weight" },
        { accessorKey: "vehicle_no", header: "Vehicle No" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status || "N/A"} type="GDN" />
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original
                const id = item.gdn_grn_ref 
                
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
