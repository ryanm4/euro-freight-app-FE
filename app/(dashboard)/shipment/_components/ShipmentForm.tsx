"use client"

import FormField from "@/components/shared/FormField"
import FormTextarea from "@/components/shared/FormTextarea"
import { Button } from "@/components/ui/button"
import { fetchHBLHAWBs } from "@/lib/api/bill_of_lading"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import HBLTable from "./HBLTable"

export default function ShipmentForm() {
  const router = useRouter()
  const [vesselName, setVesselName] = useState("")
  const [remarks, setRemarks] = useState("")
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

  return (
    <div className="mx-auto space-y-5">
      <div className="flex justify-end gap-3">
        <Button
          variant={"outline"}
          className="rounded-md"
          onClick={() => router.push("/shipment")}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={() => router.push("/shipment")}>
          Save
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
              Manage HBL / HAWB details and associated shipments
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

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Additional Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Packing lists and carton quantities
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormTextarea
                label="Remarks"
                value={remarks}
                onChange={setRemarks}
                placeholder="Type your message here."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
