"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SHIPMENT } from "@/modules/shipment/types"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowsSort, IconEye, IconDots, IconPencil, IconTrash } from "@tabler/icons-react"
import { StatusBadge } from "@/components/shared/status-badge"

interface ShipmentTableActions {
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onView: (id: string) => void
}

export const shipmentColumns = (
    actions: ShipmentTableActions,
    options?: { canModify?: boolean }
): ColumnDef<SHIPMENT>[] => {
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "vessel_name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Vessel Name <IconArrowsSort className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-semibold">{row.original.vessel_name}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status || "N/A"} type="SHIPMENT" />,
        },
        { accessorKey: "created_by", header: "Created By" },
        {
            accessorKey: "hbl_ids",
            header: "HBL IDs",
            cell: ({ row }) => <div>{row.original.hbl_ids?.join(", ")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original
                const id = item.vessel_name
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
