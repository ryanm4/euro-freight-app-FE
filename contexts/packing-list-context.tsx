"use client"

import { createContext, useContext, useState, ReactNode } from "react"

export interface UploadedPackingListItem {
  ctnNo?: number
  poNumber: string
  sku: string
  itemName: string
  color?: string
  size: string
  co?: string
  unitCost: number
  quantity: number
  ctn: number
  grossWeightKg: number
  netWeightKg: number
  ctnDemi: string
  cbm: number
}

export interface UploadedPackingListData {
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
  items: UploadedPackingListItem[]
  parseErrors: Array<{
    rowIndex: number
    poNumber: string
    rawChunk: string
  }>
}

interface PackingListContextType {
  uploadedData: UploadedPackingListData | null
  setUploadedData: (data: UploadedPackingListData | null) => void
  clearUploadedData: () => void
}

const PackingListContext = createContext<PackingListContextType | undefined>(
  undefined
)

export function PackingListProvider({ children }: { children: ReactNode }) {
  const [uploadedData, setUploadedData] =
    useState<UploadedPackingListData | null>(null)

  const clearUploadedData = () => {
    setUploadedData(null)
  }

  return (
    <PackingListContext.Provider
      value={{ uploadedData, setUploadedData, clearUploadedData }}
    >
      {children}
    </PackingListContext.Provider>
  )
}

export function usePackingListContext() {
  const context = useContext(PackingListContext)
  if (context === undefined) {
    throw new Error(
      "usePackingListContext must be used within a PackingListProvider"
    )
  }
  return context
}
