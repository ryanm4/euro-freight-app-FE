"use client"

import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GOODS_RECEIVE_NOTE } from "@/modules/grn/types"
import {
  IconArrowsSort,
  IconEye,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import Link from "next/link"

interface GoodsReceiveNoteTableActions {
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onView: (id: string) => void
}

export const goodsReceiveNoteColumns = (
  actions: GoodsReceiveNoteTableActions,
  options?: { canModify?: boolean }
): ColumnDef<GOODS_RECEIVE_NOTE>[] => {
  const canModify = options?.canModify ?? true

  return [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          GRN Number
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold">GRN-{row.original.id}</div>
      ),
    },
    {
      id: "gdn_no",
      header: "GDN Number",
      cell: ({ row }) => {
        const gdns =
          row.original.gdns?.map((pl) => ({
            id: pl.id,
            label: pl.gdn_no,
          })) || []
        const visible = gdns.slice(0, 2)
        const hasMore = gdns.length > 2

        const renderLinks = (items: typeof gdns) =>
          items.map((g, idx) => (
            <span key={g.id ?? idx} className="whitespace-nowrap">
              <Link
                href={`/gdn/${g.id}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {g.label}
              </Link>
              {idx < items.length - 1 && ","}
            </span>
          ))

        if (gdns.length === 0) return <div>-</div>

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                {renderLinks(visible)}
                {hasMore && ", ..."}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                {renderLinks(gdns)}
              </div>
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      id: "packing_list_no",
      header: "Packing List Number",
      cell: ({ row }) => {
        const packingLists =
          row.original.packing_lists?.map((pl) => ({
            id: pl.id,
            label: pl.packing_list_no,
          })) || []
        const visible = packingLists.slice(0, 2)
        const hasMore = packingLists.length > 2

        const renderLinks = (items: typeof packingLists) =>
          items.map((pl, idx) => (
            <span key={pl.id ?? idx} className="whitespace-nowrap">
              <Link
                href={`/packing-list/${pl.id}`}
                className="text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {pl.label}
              </Link>
              {idx < items.length - 1 && ","}
            </span>
          ))

        if (packingLists.length === 0) return <div>-</div>

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                {renderLinks(visible)}
                {hasMore && ", ..."}
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                {renderLinks(packingLists)}
              </div>
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "client_id",
      header: "Customer",
      cell: ({ row }) => <div>{row.original.client_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "manufacture_id",
      header: "Manufacturer",
      cell: ({ row }) => <div>{row.original.manufacture_id ?? "N/A"}</div>,
    },
    {
      accessorKey: "date",
      header: "Received Date",
      cell: ({ row }) => {
        const date = row.original.date
        return date ? format(new Date(date), "dd/MMM/yy HH:mm") : "N/A"
      },
    },
    {
      accessorKey: "total_gdn_carton_count",
      header: "Total GDN Carton Count",
      cell: ({ row }) => {
        const total = row.original.packing_lists?.reduce(
          (sum, packingList) => sum + (packingList.total_quantity ?? 0),
          0
        )

        return <div>{total ?? "N/A"}</div>
      },
    },
    {
      accessorKey: "quantity",
      header: "Actual Carton Received",
      cell: ({ row }) => <div>{row.original.quantity ?? "N/A"}</div>,
    },
    {
      accessorKey: "shipping_mode",
      header: "Shipping Mode",
      cell: ({ row }) => {
        return (
          <div>{row.original.packing_lists?.[0]?.shipping_mode ?? "N/A"}</div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status?.replaceAll("_", " ").toUpperCase() || "N/A"} type="GRN" />
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = String(row.original.id)

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
