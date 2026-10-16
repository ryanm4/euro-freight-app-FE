"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HBL_PO_Dashboard_List } from "@/modules/hbl-dashboard/types"
import { patchFreightCosts } from "@/lib/api/hbl_dashboard"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

type HBL = HBL_PO_Dashboard_List["data"][number]

interface HBLCostDialogProps {
  hbl: HBL | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatNumber = (amount: number | null) =>
  amount === null
    ? "N/A"
    : new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount)

const formatCurrency = (amount: number | null) =>
  amount === null
    ? "N/A"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount)

const parseAmount = (amount: string | null) => {
  if (amount === null || amount.trim() === "") return null
  const value = Number(amount)
  return Number.isFinite(value) ? value : null
}

const allocateAmount = (
  amount: number | null,
  weights: (number | null)[],
  totalWeight: number | null
) => {
  if (amount === null || totalWeight === null || totalWeight <= 0) {
    return weights.map(() => null)
  }

  const totalCents = Math.round(amount * 100)
  let allocatedCents = 0

  return weights.map((weight, index) => {
    if (weight === null) return null

    const cents =
      index === weights.length - 1
        ? totalCents - allocatedCents
        : Math.round((totalCents * weight) / totalWeight)
    allocatedCents += cents
    return cents / 100
  })
}

export function HBLCostDialog({ hbl, open, onOpenChange }: HBLCostDialogProps) {
  const queryClient = useQueryClient()
  const [totalVolume, setTotalVolume] = useState(hbl?.total_volume ?? "")
  const [totalFreightCost, setTotalFreightCost] = useState(
    hbl?.total_cost ?? ""
  )
  const [isSaving, setIsSaving] = useState(false)

  const poDetails = hbl?.po_details ?? []
  const cartonCounts = poDetails.map((detail) => detail.carton_count)
  const totalCartons = cartonCounts.reduce((total, count) => total + count, 0)
  const volume = parseAmount(totalVolume)
  const chargeBase =
    volume === null || totalCartons <= 0
      ? cartonCounts.map(() => null)
      : cartonCounts.map((cartonCount) => (volume / totalCartons) * cartonCount)
  const totalChargeBase = chargeBase.every((amount) => amount !== null)
    ? chargeBase.reduce<number>((total, amount) => total + (amount ?? 0), 0)
    : null
  const freightCosts = allocateAmount(
    parseAmount(totalFreightCost),
    chargeBase,
    totalChargeBase
  )
  const totalAllocatedFreight = freightCosts.every((amount) => amount !== null)
    ? freightCosts.reduce<number>((total, amount) => total + (amount ?? 0), 0)
    : null

  const handleSave = async () => {
    if (!hbl) return

    const volume = parseAmount(totalVolume)
    const cost = parseAmount(totalFreightCost)

    if (volume === null || cost === null) {
      toast.error("Enter valid total volume and total freight cost.")
      return
    }

    setIsSaving(true)
    try {
      await patchFreightCosts(String(hbl.id), {
        total_cost: cost,
        total_volume: volume,
      })
      await queryClient.invalidateQueries({ queryKey: ["hbl-dashboard"] })
      toast.success("Freight costs updated successfully.")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update HBL freight costs:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update HBL freight costs."
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Cost segregation</DialogTitle>
          <DialogDescription>
            {hbl?.house_bl_no ?? "HBL"} — charge base and freight cost are
            allocated by carton count.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hbl-total-volume" className="text-sm font-medium">
              Total Volume
            </label>
            <Input
              id="hbl-total-volume"
              type="number"
              step="any"
              value={totalVolume}
              onChange={(event) => setTotalVolume(event.target.value)}
              placeholder="Enter total volume"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="hbl-total-freight-cost"
              className="text-sm font-medium"
            >
              Total Freight Cost
            </label>
            <Input
              id="hbl-total-freight-cost"
              type="number"
              step="any"
              value={totalFreightCost}
              onChange={(event) => setTotalFreightCost(event.target.value)}
              placeholder="Enter total freight cost"
            />
          </div>
        </div>
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO number</TableHead>
                <TableHead className="text-right">Carton count</TableHead>
                <TableHead className="text-right">Charge base</TableHead>
                <TableHead className="text-right">Freight cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {poDetails.length > 0 ? (
                poDetails.map((detail, index) => (
                  <TableRow key={`${detail.po_number}-${index}`}>
                    <TableCell>{detail.po_number}</TableCell>
                    <TableCell className="text-right">
                      {detail.carton_count}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(chargeBase[index])}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(freightCosts[index])}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No PO details available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            {poDetails.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalCartons}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(totalChargeBase)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalAllocatedFreight)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={
              isSaving
              // totalVolume.trim() !== "" ||
              // totalFreightCost.trim() !== ""
            }
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
