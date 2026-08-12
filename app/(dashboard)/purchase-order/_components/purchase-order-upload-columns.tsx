"use client"

import { Button } from "@/components/ui/button"
import { IconArrowsSort } from "@tabler/icons-react"
import { ColumnDef } from "@tanstack/react-table"

export interface PURCHASE_ORDER_UPLOAD_ITEM {
  product: string
  style: string
  colorway: string
  sizes: {
    XS: number
    S: number
    M: number
    L: number
    XL: number
    "2XL": number
    "3XL": number
    "4XL": number
  }
  totalQty: number
}

const sizeColumns = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const

export const purchaseOrderUploadColumns: ColumnDef<PURCHASE_ORDER_UPLOAD_ITEM>[] =
  [
    {
      accessorKey: "product",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-left font-medium">{row.original.product}</div>
      ),
    },

    {
      accessorKey: "style",
      header: "Style",
      cell: ({ row }) => <div className="text-left">{row.original.style}</div>,
    },

    {
      accessorKey: "colorway",
      header: "Colorway",
      cell: ({ row }) => (
        <div className="text-left">{row.original.colorway}</div>
      ),
    },

    ...sizeColumns.map(
      (size): ColumnDef<PURCHASE_ORDER_UPLOAD_ITEM> => ({
        id: `size_${size}`,
        accessorFn: (row) => row.sizes[size],
        header: size,
        cell: ({ row }) => (
          <div className="text-center tabular-nums">
            {row.original.sizes[size].toLocaleString()}
          </div>
        ),
      })
    ),

    {
      id: "totalQty",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Qty
          <IconArrowsSort className="ml-2 h-4 w-4" />
        </Button>
      ),
      accessorFn: (row) =>
        Object.values(row.sizes).reduce(
          (total, quantity) => total + (Number(quantity) || 0),
          0
        ),
      cell: ({ row }) => {
        const totalQty = Object.values(row.original.sizes).reduce(
          (total, quantity) => total + (Number(quantity) || 0),
          0
        )

        return (
          <div className="text-center font-semibold tabular-nums">
            {totalQty.toLocaleString()}
          </div>
        )
      },
    },
  ]
