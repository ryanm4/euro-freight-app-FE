"use client"

import { createContext, useContext, useState, ReactNode } from "react"

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
