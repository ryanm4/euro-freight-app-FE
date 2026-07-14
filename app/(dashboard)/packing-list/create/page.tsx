"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import PackingListForm from "../_components/packing-list-form"
import { usePackingListContext } from "@/contexts/packing-list-context"

interface UploadedPackingListData {
  success: boolean
  filename: string
  pages: number
  rowCount: number
  rowsFailedToParse: number
  totals: {
    totalQuantity: number
    totalCartons: number
    totalGrossWeight: number
    totalNetWeight: number
    totalCbm: number
  }
  items: Array<{
    poNumber: string
    sku: string
    itemDescription: string
    size: string
    unitCost: number
    quantity: number
    ctnCount: number
    grossWeightKg: number
    netWeightKg: number
    cartonDimensions: string
    cbm: number
  }>
  parseErrors: Array<{
    rowIndex: number
    poNumber: string
    rawChunk: string
  }>
}

export default function PackingListCreatePage() {
  const router = useRouter()
  const { uploadedData } = usePackingListContext()

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Packing List"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Packing List", href: "/packing-list" },
          { title: "Add", href: "/packing-list/create" },
        ]}
      />

      <div className="mt-4">
        <PackingListForm uploadedData={uploadedData} />
      </div>
    </div>
  )
}
