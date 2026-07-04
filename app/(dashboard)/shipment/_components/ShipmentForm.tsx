"use client"

import FormField from "@/components/shared/FormField"
import { Button } from "@/components/ui/button"
import { fetchHBLHAWBs } from "@/lib/api/bill_of_lading"
import { createShipment } from "@/lib/api/shipments"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import HBLTable from "./HBLTable"

export default function ShipmentForm() {
  const router = useRouter()
  const [vesselName, setVesselName] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedHBLIds, setSelectedHBLIds] = useState<Set<number>>(new Set())

  const { data: hblsRes } = useQuery({
    queryKey: ["hbl-hawbs"],
    queryFn: fetchHBLHAWBs,
  })

  const hbls = hblsRes?.data ?? []

  const toggleHblRow = (id: number) => {
    setSelectedHBLIds((prev) =>
      prev.has(id)
        ? new Set([...prev].filter((r) => r !== id))
        : new Set([...prev, id])
    )
  }

  const handleSave = async () => {
    if (!vesselName.trim()) return
    setIsSaving(true)
    try {
      await createShipment({
        vessel_name: vesselName,
        status: "Planned",
        created_by: "admin",
        hbl_ids: Array.from(selectedHBLIds),
      })
      router.push("/shipment")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto space-y-5">
      <div className="flex justify-end gap-3">
        <Button
          variant={"outline"}
          className="rounded-md"
          onClick={() => router.push("/shipment")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          className="rounded-md"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Vessel Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Manage vessel details and associated HBL shipments
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Vessel Name "
                id="vessel-name"
                placeholder="Enter Vessel Name"
                value={vesselName}
                onChange={setVesselName}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              HBL / HAWB Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Select HBL / HAWB records to associate with this shipment
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <HBLTable
                hbls={(hbls ?? []) as any[]}
                selectedIds={selectedHBLIds}
                onToggle={toggleHblRow}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
