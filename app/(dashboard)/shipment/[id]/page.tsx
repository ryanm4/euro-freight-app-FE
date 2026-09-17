"use client"

import { useEffect, useState } from "react"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchShipmentById } from "@/lib/api/shipments"
import { SHIPMENT } from "@/modules/shipment/types"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import HBLTable from "../_components/HBLTable"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Mode = "" | "AIR" | "SEA"

const inferMode = (shipment: SHIPMENT): Mode => {
  if (shipment.flight_number || shipment.origin || shipment.destination) {
    return "AIR"
  }
  if (
    shipment.vessel_name ||
    shipment.origin_port ||
    shipment.discharge_port ||
    shipment.container_number
  ) {
    return "SEA"
  }
  return ""
}

export default function ShipmentByID() {
  const { id } = useParams<{ id: string }>()
  const [mode, setMode] = useState<Mode>("")

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => fetchShipmentById(id),
  })

  const data = res?.data as SHIPMENT | undefined

  useEffect(() => {
    setMode(data ? inferMode(data) : "")
  }, [data])

  if (isLoading) return <div>Loading…</div>
  if (isError || !data) return <>Not found</>

  const handleHblRowClick = (hbl: any) => {
    // Function to handle HBL row click - would navigate to HBL view page
    // Navigation logic would go here, e.g., router.push(`/hbl-hawb/${hbl.id}`)
    // console.log("Navigate to HBL view:", hbl.id)
  }

  const inputClass =
    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          // title={`Shipment-${id}`}
          title={`Shipment`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Shipment", href: "/shipment" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" disabled>
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Vessel Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Core shipment information and vessel details
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="mode"
                className="text-xs font-medium text-foreground"
              >
                Mode
              </Label>
              <Select
                value={mode}
                // onValueChange={(v) => handleModeChange(v as Mode)}
              >
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

            {/* {mode === "SEA" && (
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
                  value={data.vessel_name ?? ""}
                  readOnly={true}
                  className={inputClass}
                />
              </div>
            )} */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="status"
                className="text-xs font-medium text-foreground"
              >
                Status
              </Label>
              <Input
                id="status"
                placeholder="Enter Status"
                value={data.status ?? ""}
                readOnly={true}
                className={inputClass}
              />
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
                value={data.mbl_mawb_no}
                // onChange={(e) => handleChange("mbl_mawb_no", e.target.value)}
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
                value={data.airline_shipping_line}
                // onChange={(e) =>
                //   handleChange("airline_shipping_line", e.target.value)
                // }
                readOnly={true}
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
                value={data.flight_number}
                // onChange={(e) => handleChange("flight_number", e.target.value)}
                readOnly={true}
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
                value={data.origin}
                // onChange={(e) => handleChange("origin", e.target.value)}
                readOnly={true}
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
                value={data.destination}
                // onChange={(e) => handleChange("destination", e.target.value)}
                readOnly={true}
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
                value={data.etd_origin}
                // onChange={(e) => handleChange("etd_origin", e.target.value)}
                readOnly={true}
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
                value={data.eta_destination}
                // onChange={(e) =>
                //   handleChange("eta_destination", e.target.value)
                // }
                readOnly={true}
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
                value={data.airline_shipping_line}
                // onChange={(e) =>
                //   handleChange("airline_shipping_line", e.target.value)
                // }
                readOnly={true}
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
                value={data.vessel_name ?? ""}
                // onChange={(e) => handleChange("vessel_name", e.target.value)}
                readOnly={true}
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
                value={data.voyage_number}
                // onChange={(e) => handleChange("voyage_number", e.target.value)}
                readOnly={true}
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
                value={data.origin_port}
                // onChange={(e) => handleChange("origin_port", e.target.value)}
                readOnly={true}
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
                value={data.discharge_port}
                // onChange={(e) => handleChange("discharge_port", e.target.value)}
                readOnly={true}
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
                value={data.final_place_of_delivery}
                // onChange={(e) =>
                //   handleChange("final_place_of_delivery", e.target.value)
                // }
                readOnly={true}
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
                value={data.etd_colombo}
                // onChange={(e) => handleChange("etd_colombo", e.target.value)}
                readOnly={true}
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
                value={data.eta_discharge_port}
                // onChange={(e) =>
                //   handleChange("eta_discharge_port", e.target.value)
                // }
                readOnly={true}
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
                value={data.eta_final_delivery_place}
                // onChange={(e) =>
                //   handleChange("eta_final_delivery_place", e.target.value)
                // }
                readOnly={true}
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
                value={data.container_number}
                // onChange={(e) =>
                //   handleChange("container_number", e.target.value)
                // }
                readOnly={true}
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
                value={data.container_size}
                // onChange={(e) => handleChange("container_size", e.target.value)}
                readOnly={true}
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
                value={data.final_seal_no}
                // onChange={(e) => handleChange("final_seal_no", e.target.value)}
                readOnly={true}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              HBL / HAWB Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of associated House Bill of Lading / House Air Waybill
              records
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <HBLTable
                hbls={(data.hbl_hawb_details ?? []) as any[]}
                readOnly={true}
                onRowClick={handleHblRowClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
