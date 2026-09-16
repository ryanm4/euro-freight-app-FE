"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchHBLHAWBs } from "@/lib/api/bill_of_lading"
import { createShipment } from "@/lib/api/shipments"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import HBLTable from "./HBLTable"

export default function ShipmentForm() {
  const router = useRouter()

  const [mode, setMode] = useState("") // "AIR" | "SEA"
  const [status, setStatus] = useState("planned")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedHBLIds, setSelectedHBLIds] = useState<Set<number>>(new Set())

  // Common
  const [mblMawbNo, setMblMawbNo] = useState("")
  const [airlineShippingLine, setAirlineShippingLine] = useState("")

  // Sea-specific
  const [vesselName, setVesselName] = useState("")
  const [voyageNumber, setVoyageNumber] = useState("")
  const [originPort, setOriginPort] = useState("")
  const [dischargePort, setDischargePort] = useState("")
  const [finalPlaceOfDelivery, setFinalPlaceOfDelivery] = useState("")
  const [etdColombo, setEtdColombo] = useState("")
  const [etaDischargePort, setEtaDischargePort] = useState("")
  const [etaFinalDeliveryPlace, setEtaFinalDeliveryPlace] = useState("")
  const [containerNumber, setContainerNumber] = useState("")
  const [containerSize, setContainerSize] = useState("")
  const [finalSealNo, setFinalSealNo] = useState("")

  // Air-specific
  const [flightNumber, setFlightNumber] = useState("")
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [etdOrigin, setEtdOrigin] = useState("")
  const [etaDestination, setEtaDestination] = useState("")

  const { data: hblsRes } = useQuery({
    queryKey: ["hbl-hawbs", "COMPLETED", mode],
    queryFn: () => fetchHBLHAWBs("COMPLETED", mode),
    enabled: !!mode,
  })

  const hbls = hblsRes?.data ?? []

  const toggleHblRow = (id: number) => {
    setSelectedHBLIds((prev) =>
      prev.has(id)
        ? new Set([...prev].filter((r) => r !== id))
        : new Set([...prev, id])
    )
  }

  const handleHblRowClick = (hbl: any) => {
    console.log("Navigate to HBL view:", hbl.id)
  }

  const handleModeChange = (v: string) => {
    setMode(v)
    setSelectedHBLIds(new Set())
  }

  const handleSave = async () => {
    if (!mode) return
    setIsSaving(true)
    try {
      const basePayload = {
        status,
        mbl_mawb_no: mblMawbNo || null,
        airline_shipping_line: airlineShippingLine || null,
        created_by: "admin",
        hbl_ids: Array.from(selectedHBLIds),
      }

      const payload =
        mode === "AIR"
          ? {
              ...basePayload,
              vessel_name: null,
              voyage_number: null,
              origin_port: null,
              discharge_port: null,
              final_place_of_delivery: null,
              etd_colombo: null,
              eta_discharge_port: null,
              eta_final_delivery_place: null,
              container_number: null,
              container_size: null,
              final_seal_no: null,
              flight_number: flightNumber || null,
              origin: origin || null,
              destination: destination || null,
              etd_origin: etdOrigin || null,
              eta_destination: etaDestination || null,
            }
          : {
              ...basePayload,
              vessel_name: vesselName || null,
              voyage_number: voyageNumber || null,
              origin_port: originPort || null,
              discharge_port: dischargePort || null,
              final_place_of_delivery: finalPlaceOfDelivery || null,
              etd_colombo: etdColombo || null,
              eta_discharge_port: etaDischargePort || null,
              eta_final_delivery_place: etaFinalDeliveryPlace || null,
              container_number: containerNumber || null,
              container_size: containerSize || null,
              final_seal_no: finalSealNo || null,
              flight_number: null,
              origin: null,
              destination: null,
              etd_origin: null,
              eta_destination: null,
            }

      await createShipment(payload)
      router.push("/shipment")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass =
    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"

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
          disabled={isSaving || !mode}
          onClick={handleSave}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Choose a mode to reveal the relevant fields
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="mode"
                  className="text-xs font-medium text-foreground"
                >
                  Mode
                </Label>
                <Select value={mode} onValueChange={handleModeChange}>
                  <SelectTrigger
                    id="mode"
                    className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500"
                  >
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-[#0A0A0A] text-zinc-100">
                    <SelectItem value="SEA">Sea</SelectItem>
                    <SelectItem value="AIR">Air</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="status"
                  className="text-xs font-medium text-foreground"
                >
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    id="status"
                    className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-[#0A0A0A] text-zinc-100">
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="departure">Departure</SelectItem>
                    <SelectItem value="in transit">In Transit</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="mbl-mawb-no"
                  className="text-xs font-medium text-foreground"
                >
                  MBL / MAWB No
                </Label>
                <Input
                  id="mbl-mawb-no"
                  placeholder="Enter MBL / MAWB No"
                  value={mblMawbNo}
                  onChange={(e) => setMblMawbNo(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {mode === "AIR" && (
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Air Information
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Flight and routing details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="airline"
                  className="text-xs font-medium text-foreground"
                >
                  Airline
                </Label>
                <Input
                  id="airline"
                  placeholder="Enter Airline"
                  value={airlineShippingLine}
                  onChange={(e) => setAirlineShippingLine(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="flight-number"
                  className="text-xs font-medium text-foreground"
                >
                  Flight Number
                </Label>
                <Input
                  id="flight-number"
                  placeholder="Enter Flight Number"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="origin"
                  className="text-xs font-medium text-foreground"
                >
                  Origin
                </Label>
                <Input
                  id="origin"
                  placeholder="Enter Origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="destination"
                  className="text-xs font-medium text-foreground"
                >
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="Enter Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="etd-origin"
                  className="text-xs font-medium text-foreground"
                >
                  ETD Origin
                </Label>
                <Input
                  id="etd-origin"
                  type="date"
                  value={etdOrigin}
                  onChange={(e) => setEtdOrigin(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="eta-destination"
                  className="text-xs font-medium text-foreground"
                >
                  ETA Destination
                </Label>
                <Input
                  id="eta-destination"
                  type="date"
                  value={etaDestination}
                  onChange={(e) => setEtaDestination(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        {mode === "SEA" && (
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Vessel Information
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Vessel, container and routing details
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="shipping-line"
                  className="text-xs font-medium text-foreground"
                >
                  Shipping Line
                </Label>
                <Input
                  id="shipping-line"
                  placeholder="Enter Shipping Line"
                  value={airlineShippingLine}
                  onChange={(e) => setAirlineShippingLine(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="vessel-name"
                  className="text-xs font-medium text-foreground"
                >
                  Vessel Name
                </Label>
                <Input
                  id="vessel-name"
                  placeholder="Enter Vessel Name"
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="voyage-number"
                  className="text-xs font-medium text-foreground"
                >
                  Voyage Number
                </Label>
                <Input
                  id="voyage-number"
                  placeholder="Enter Voyage Number"
                  value={voyageNumber}
                  onChange={(e) => setVoyageNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="origin-port"
                  className="text-xs font-medium text-foreground"
                >
                  Origin Port
                </Label>
                <Input
                  id="origin-port"
                  placeholder="Enter Origin Port"
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="discharge-port"
                  className="text-xs font-medium text-foreground"
                >
                  Discharge Port
                </Label>
                <Input
                  id="discharge-port"
                  placeholder="Enter Discharge Port"
                  value={dischargePort}
                  onChange={(e) => setDischargePort(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="final-place-of-delivery"
                  className="text-xs font-medium text-foreground"
                >
                  Final Place of Delivery
                </Label>
                <Input
                  id="final-place-of-delivery"
                  placeholder="Enter Final Place of Delivery"
                  value={finalPlaceOfDelivery}
                  onChange={(e) => setFinalPlaceOfDelivery(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="etd-colombo"
                  className="text-xs font-medium text-foreground"
                >
                  ETD Colombo
                </Label>
                <Input
                  id="etd-colombo"
                  type="date"
                  value={etdColombo}
                  onChange={(e) => setEtdColombo(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="eta-discharge-port"
                  className="text-xs font-medium text-foreground"
                >
                  ETA Discharge Port
                </Label>
                <Input
                  id="eta-discharge-port"
                  type="date"
                  value={etaDischargePort}
                  onChange={(e) => setEtaDischargePort(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="eta-final-delivery-place"
                  className="text-xs font-medium text-foreground"
                >
                  ETA Final Delivery Place
                </Label>
                <Input
                  id="eta-final-delivery-place"
                  type="date"
                  value={etaFinalDeliveryPlace}
                  onChange={(e) => setEtaFinalDeliveryPlace(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="container-number"
                  className="text-xs font-medium text-foreground"
                >
                  Container Number
                </Label>
                <Input
                  id="container-number"
                  placeholder="Enter Container Number"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="container-size"
                  className="text-xs font-medium text-foreground"
                >
                  Container Size
                </Label>
                <Input
                  id="container-size"
                  placeholder="e.g. 40HC"
                  value={containerSize}
                  onChange={(e) => setContainerSize(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="final-seal-no"
                  className="text-xs font-medium text-foreground"
                >
                  Final Seal No
                </Label>
                <Input
                  id="final-seal-no"
                  placeholder="Enter Final Seal No"
                  value={finalSealNo}
                  onChange={(e) => setFinalSealNo(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

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
            {!mode ? (
              <p className="text-xs text-zinc-500">
                Select a mode to load HBL / HAWB records.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-neutral-700">
                <HBLTable
                  hbls={(hbls ?? []) as any[]}
                  selectedIds={selectedHBLIds}
                  onToggle={toggleHblRow}
                  onRowClick={handleHblRowClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}