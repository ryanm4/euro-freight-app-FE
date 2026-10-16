"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { HBL_PO_Dashboard_List } from "@/modules/hbl-dashboard/types"
import {
  IconEye,
  IconPencil,
  IconTrash,
  IconBasketDollar,
} from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

interface HBLDashboardTableActions {
  // onEdit: (id: string) => void
  // onDelete: (id: string) => void
  onView: (id: string) => void
  onCostView: (hbl: HBL_PO_Dashboard_List["data"][number]) => void
}

export const hbl_dashboard_AIR_Columns = (
  actions: HBLDashboardTableActions,
  options?: { canModify?: boolean }
): ColumnDef<HBL_PO_Dashboard_List["data"][number]>[] => {
  const canModify = options?.canModify ?? true

  const formatDate = (date?: string | null) => {
    return date ? format(new Date(date), "dd/MMM/yy") : "N/A"
  }

  return [
    {
      accessorKey: "house_bl_no",
      header: "HAWB number",
      cell: ({ row }) => row.original.house_bl_no || "N/A",
    },
    {
      id: "mbl_number",
      accessorFn: (row) =>
        row.mbl_mawb_no ?? row.shipments?.[0]?.mbl_mawb_no ?? "N/A",
      header: "MAWB number",
    },
    {
      id: "destination",
      accessorFn: (row) => row.shipments?.[0]?.destination ?? "N/A",
      header: "Destination",
    },
    // {
    //   id: "shipping_mode",
    //   accessorFn: (row) =>
    //     [
    //       ...new Set(
    //         row.shipments
    //           .flatMap((shipment) => shipment.grns)
    //           .flatMap((grn) =>
    //             grn.gdns.flatMap((gdn) =>
    //               gdn.packing_lists.map(
    //                 (packingList) => packingList.shipping_mode
    //               )
    //             )
    //           )
    //       ),
    //     ].join(", ") || "N/A",
    //   header: "shipping mode",
    // },
    {
      id: "total_carton_count",
      accessorFn: (row) =>
        row.po_details?.reduce(
          (total, detail) => total + detail.carton_count,
          0
        ) ?? 0,
      header: "Total carton count",
    },
    {
      id: "airline_shipping_line",
      accessorFn: (row) => row.shipments?.[0]?.airline_shipping_line ?? "N/A",
      header: "Air Line",
    },
    {
      id: "flight_number",
      accessorFn: (row) => row.shipments?.[0]?.flight_number ?? "N/A",
      header: "Flight Number",
    },
    {
      id: "etd_origin",
      accessorFn: (row) => row.shipments?.[0]?.etd_origin ?? null,
      header: "ETD Origin",
      cell: ({ row }) => formatDate(row.original.shipments?.[0]?.etd_origin),
    },
    // {
    //   id: "discharge_port",
    //   accessorFn: (row) => row.shipments?.[0]?.discharge_port ?? "N/A",
    //   header: "Discharge Port",
    // },
    // {
    //   id: "discharge_port_eta",
    //   accessorFn: (row) => row.shipments?.[0]?.eta_discharge_port ?? null,
    //   header: "Discharge Port ETA",
    //   cell: ({ row }) =>
    //     formatDate(row.original.shipments?.[0]?.eta_discharge_port),
    // },
    {
      id: "eta_destination",
      accessorFn: (row) =>
        row.shipments?.[0]?.eta_destination ??
        row.shipments?.[0]?.eta_final_delivery_place ??
        null,
      header: "ETA-Destination",
      cell: ({ row }) =>
        formatDate(
          row.original.shipments?.[0]?.eta_destination ??
            row.original.shipments?.[0]?.eta_final_delivery_place
        ),
    },
    {
      accessorKey: "total_cost",
      header: "Total Freight cost",
      cell: ({ row }) =>
        row.original.total_cost ? `$ ${row.original.total_cost}` : "N/A",
    },
    // {
    //   accessorKey: "total_volume",
    //   header: "Total Freight Volume",
    //   cell: ({ row }) =>
    //     row.original.total_volume ? `$ ${row.original.total_volume}` : "N/A",
    // },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = String(row.original.id)
        const statusLower = row.original.status?.trim().toLowerCase() ?? ""
        const isCompleted =
          statusLower === "completed" || statusLower === "completed_hbl"
        const canModifyRow = canModify && !isCompleted

        return (
          <div className="flex items-start gap-2">
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
                {/* <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={!canModifyRow}
                      onClick={() => actions.onEdit(id)}
                    >
                      <IconPencil className="h-4 w-4 text-zinc-400 hover:text-zinc-100" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {canModifyRow
                      ? "Edit"
                      : "Editing disabled for completed records"}
                  </TooltipContent>
                </Tooltip> */}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 p-0 disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={!canModifyRow}
                      onClick={() => actions.onCostView(row.original)}
                    >
                      <IconBasketDollar className="h-4 w-4 text-destructive hover:text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View Cost Segregation</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )
      },
    },
  ]
}
