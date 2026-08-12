"use client"

import { ColumnDef } from "@tanstack/react-table"

export type PurchaseOrderDetailItem = {
  id: number
  po_id: number
  product: string
  style: string
  colorway: string
  xs: number
  s: number
  m: number
  l: number
  xl: number
  "2xl": number
  "3xl": number
  "4xl": number
  totalQty: number
}

export const purchaseOrderDetailColumns: ColumnDef<PurchaseOrderDetailItem>[] =
  [
    {
      accessorKey: "product",
      header: "Product",
    },
    {
      accessorKey: "style",
      header: "Style",
    },
    {
      accessorKey: "colorway",
      header: "Colorway",
    },
    {
      accessorKey: "xs",
      header: "XS",
    },
    {
      accessorKey: "s",
      header: "S",
    },
    {
      accessorKey: "m",
      header: "M",
    },
    {
      accessorKey: "l",
      header: "L",
    },
    {
      accessorKey: "xl",
      header: "XL",
    },
    {
      accessorKey: "2xl",
      header: "2XL",
    },
    {
      accessorKey: "3xl",
      header: "3XL",
    },
    {
      accessorKey: "4xl",
      header: "4XL",
    },
    {
      accessorKey: "totalQty",
      header: "Total Qty",
    },
  ]
