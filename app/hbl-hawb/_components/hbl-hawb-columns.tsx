"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { HBL_HAWB } from "@/modules/hbl-hawb/types"
import { ColumnDef } from "@tanstack/react-table"
import { IconArrowsSort, IconEye, IconDots, IconPencil, IconTrash } from "@tabler/icons-react"
import { StatusBadge } from "@/components/shared/status-badge"
import { format } from "date-fns"

interface HBLHAWBTableActions {
    onEdit: (id: string) => void
    onDelete: (id: string) => void
    onView: (id: string) => void
}

export const hblHawbColumns = (
    actions: HBLHAWBTableActions,
    options?: { canModify?: boolean }
): ColumnDef<HBL_HAWB>[] => {
    const canModify = options?.canModify ?? true;

    return [
        {
            accessorKey: "mbl_mawb_no",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    MBL/MAWB No <IconArrowsSort className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="font-semibold">{row.original.mbl_mawb_no}</div>,
        },
        { accessorKey: "type", header: "Type" },
        { accessorKey: "planned_vessel_name", header: "Vessel Name" },
        { accessorKey: "voyage_no", header: "Voyage No" },
        {
            accessorKey: "etd",
            header: "ETD",
            cell: ({ row }) => {
                const date = row.original.etd
                return date ? format(new Date(date), "PPP") : "N/A"
            }
        },
        {
            accessorKey: "eta",
            header: "ETA",
            cell: ({ row }) => {
                const date = row.original.eta
                return date ? format(new Date(date), "PPP") : "N/A"
            }
        },
        { accessorKey: "arrival_port", header: "Arrival Port" },
        { accessorKey: "no_pieces", header: "Pieces" },
        { accessorKey: "gross_weight", header: "Gross Weight" },
        { accessorKey: "cbm", header: "CBM" },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.original.status || "N/A"} type="HBL_HAWB" />,
        },
        { accessorKey: "created_by", header: "Created By" },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const item = row.original
                const id = item.mbl_mawb_no
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
