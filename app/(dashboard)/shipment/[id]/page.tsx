"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import { fetchShipmentById } from "@/lib/api/shipments"
import { SHIPMENT } from "@/modules/shipment/types"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import GRNTable from "../_components/GRNTable"
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

const formatDateVal = (val?: string | null) => {
  if (!val) return ""
  return val.length >= 10 ? val.slice(0, 10) : val
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

  const { data: grnsRes } = useQuery({
    queryKey: ["goods_receive_notes"],
    queryFn: () => fetchGRNs(),
  })

  const data = res?.data as SHIPMENT | undefined

  const allGRNs = useMemo(() => {
    return Array.isArray(grnsRes)
      ? grnsRes
      : Array.isArray(grnsRes?.data)
        ? grnsRes.data
        : []
  }, [grnsRes])

  const enrichedGRNs = useMemo(() => {
    const rawGRNs = ((data as any)?.grns ?? (data as any)?.grn_details ?? []) as any[]
    if (!rawGRNs.length) return []
    return rawGRNs.map((item: any) => {
      const fullGRN = allGRNs.find((g: any) => Number(g.id) === Number(item.id))
      return fullGRN ? { ...item, ...fullGRN } : item
    })
  }, [data, allGRNs])

  useEffect(() => {
    setMode(data ? inferMode(data) : "")
  }, [data])

  if (isLoading) return <div className="p-6">Loading…</div>
  if (isError || !data) return <div className="p-6">Not found</div>

  const inputClass =
    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm font-semibold text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none cursor-default opacity-100 disabled:opacity-100"

  const statusLower = data.status?.trim().toLowerCase() ?? ""
  const isEditable = statusLower === "planned" || statusLower === "draft"

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`Shipment #${id}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Shipment", href: "/shipment" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        {isEditable ? (
          <Link href={`/shipment/${id}/edit`}>
            <Button className="rounded-md">Edit</Button>
          </Link>
        ) : (
          <Button className="rounded-md" disabled>
            Edit
          </Button>
        )}
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
                <Select value={mode} disabled>
                  <SelectTrigger
                    id="mode"
                    className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 opacity-100 disabled:opacity-100"
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
                <Select value={statusLower || "planned"} disabled>
                  <SelectTrigger
                    id="status"
                    className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 opacity-100 disabled:opacity-100"
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
                  value={data.mbl_mawb_no ?? ""}
                  readOnly
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
                  value={data.airline_shipping_line ?? ""}
                  readOnly
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
                  value={data.flight_number ?? ""}
                  readOnly
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
                  value={data.origin ?? ""}
                  readOnly
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
                  placeholder="Destination"
                  value={data.destination ?? ""}
                  readOnly
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
                  value={formatDateVal(data.etd_origin)}
                  readOnly
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
                  value={formatDateVal(data.eta_destination)}
                  readOnly
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
                  value={data.airline_shipping_line ?? ""}
                  readOnly
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
                  readOnly
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
                  value={data.voyage_number ?? ""}
                  readOnly
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
                  value={data.origin_port ?? ""}
                  readOnly
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
                  value={data.discharge_port ?? ""}
                  readOnly
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
                  placeholder="Destination"
                  value={data.final_place_of_delivery ?? ""}
                  readOnly
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
                  value={formatDateVal(data.etd_colombo)}
                  readOnly
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
                  value={formatDateVal(data.eta_discharge_port)}
                  readOnly
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
                  value={formatDateVal(data.eta_final_delivery_place)}
                  readOnly
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
                  value={data.container_number ?? ""}
                  readOnly
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
                  value={data.container_size ?? ""}
                  readOnly
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
                  value={data.final_seal_no ?? ""}
                  readOnly
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              GRN Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of associated Goods Received Notes
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <GRNTable
                grns={enrichedGRNs}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
