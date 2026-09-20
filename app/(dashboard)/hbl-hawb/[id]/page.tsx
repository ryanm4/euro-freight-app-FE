"use client"

import Link from "next/link"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fetchBillOfLadingById } from "@/lib/api/bill_of_lading"
import { fetchShipments } from "@/lib/api/shipments"
import { cn } from "@/lib/utils"
import { IconCalendarFilled } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import ShipmentSelectionTable from "../_components/ShipmentSelectionTable"

const parseDate = (val: string): Date | undefined => {
  if (!val) return undefined
  let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
  if (isValid(d)) return d
  d = parse(val, "yyyy-MM-dd", new Date())
  if (isValid(d)) return d
  d = new Date(val)
  if (isValid(d)) return d
  return undefined
}

export default function HBLHAWBByID() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hbl-hawb", id],
    queryFn: () => fetchBillOfLadingById(id),
  })

  const { data: shipmentsData } = useQuery({
    queryKey: ["shipments"],
    queryFn: fetchShipments,
  })

  const data = res?.data

  const linkedShipment = useMemo(() => {
    if (!data) return null

    const rawLinked =
      data.shipment ?? (Array.isArray(data.shipments) ? data.shipments[0] : null)
    let linkedId =
      rawLinked?.id ??
      data.shipment_id ??
      (Array.isArray(data.shipment_ids) ? data.shipment_ids[0] : null)

    if (!linkedId && Array.isArray(data.grns) && data.grns.length > 0) {
      linkedId = data.grns[0].shipment_id ?? data.grns[0].shipment?.id
    }

    if (!linkedId && !rawLinked) return null

    const rawList = Array.isArray(shipmentsData)
      ? shipmentsData
      : Array.isArray(shipmentsData?.data)
        ? shipmentsData.data
        : []

    const targetId = Number(linkedId ?? rawLinked?.id)
    const fullShipment = rawList.find(
      (s: any) => Number(s.id) === targetId
    )
    return fullShipment ? { ...rawLinked, ...fullShipment } : rawLinked
  }, [data, shipmentsData])

  const selectedShipmentIds = useMemo(() => {
    const set = new Set<number>()
    if (linkedShipment?.id) {
      set.add(Number(linkedShipment.id))
    }
    return set
  }, [linkedShipment])

  const selectedGrnIds = useMemo(() => {
    const set = new Set<number>()
    if (Array.isArray(data?.grns)) {
      data.grns.forEach((g: any) => {
        const gid = typeof g === "object" ? g.id : g
        if (gid) set.add(Number(gid))
      })
    }
    return set
  }, [data])

  const shipmentValues = useMemo(() => {
    if (!linkedShipment) {
      return {
        mblMawbNo: data?.mbl_mawb_no ?? "",
        vesselName: data?.planned_vessel_name ?? "",
        voyageNo: data?.voyage_no ?? "",
        origin: "",
        destination: data?.inland_location ?? "",
        originPort: "",
        dischargePort: data?.arrival_port ?? "",
        finalPlaceOfDelivery: data?.inland_location ?? "",
        estimatedTimeOfDelivery: data?.etd ?? "",
        estimatedTimeOfArrival: data?.eta ?? "",
        actualTimeOfDelivery: data?.actual_etd ?? "",
        noOfPieces: data?.no_pieces != null ? String(data.no_pieces) : "",
        totalPiecesCount: "",
        grossWeight: data?.gross_weight != null ? String(data.gross_weight) : "",
        chargeableWeight:
          data?.chargeable_weight != null ? String(data.chargeable_weight) : "",
        cbm: data?.cbm != null ? String(data.cbm) : "",
      }
    }

    const s = linkedShipment
    const vesselOrAirline = s.vessel_name ?? s.airline_shipping_line ?? ""
    const voyageOrFlight = s.voyage_number ?? s.flight_number ?? ""
    const orig = s.origin ?? s.origin_port ?? ""
    const dest =
      s.destination ?? s.discharge_port ?? s.final_place_of_delivery ?? ""
    const origPort = s.origin_port ?? s.origin ?? ""
    const dischPort = s.discharge_port ?? s.destination ?? ""
    const finalDeliv = s.final_place_of_delivery ?? s.destination ?? ""
    const etdVal = s.etd_colombo ?? s.etd_origin ?? data?.etd ?? ""
    const etaVal =
      s.eta_discharge_port ??
      s.eta_destination ??
      s.eta_final_delivery_place ??
      data?.eta ??
      ""
    const actualEtdVal = s.eta_final_delivery_place ?? data?.actual_etd ?? ""

    const grns = s.grns ?? s.grn_details ?? data?.grns ?? []
    let totalCartonCount = 0
    let totalPiecesCount = 0
    let totalGrossWeight = 0
    let totalGrossVolume = 0

    if (Array.isArray(grns)) {
      grns.forEach((g: any) => {
        if (typeof g === "object") {
          if (g.quantity != null) {
            totalPiecesCount += Number(g.quantity) || 0
          }

          if (g.actual_carton_count != null) {
            totalCartonCount += Number(g.actual_carton_count) || 0
          } else if (Array.isArray(g.gdns) && g.gdns.length > 0) {
            g.gdns.forEach((gdn: any) => {
              const c = gdn.actual_cartoons ?? gdn.cartoons
              if (c != null) totalCartonCount += Number(c) || 0
            })
          } else if (
            Array.isArray(g.packing_lists) &&
            g.packing_lists.length > 0
          ) {
            g.packing_lists.forEach((pl: any) => {
              if (pl.total_cartons != null)
                totalCartonCount += Number(pl.total_cartons) || 0
            })
          }

          if (Array.isArray(g.gdns) && g.gdns.length > 0) {
            g.gdns.forEach((gdn: any) => {
              const w = gdn.actual_gross_weight ?? gdn.gross_weight
              if (w != null) totalGrossWeight += parseFloat(String(w)) || 0

              const v = gdn.actual_gross_volume ?? gdn.gross_volume
              if (v != null) totalGrossVolume += parseFloat(String(v)) || 0
            })
          } else if (
            Array.isArray(g.packing_lists) &&
            g.packing_lists.length > 0
          ) {
            g.packing_lists.forEach((pl: any) => {
              if (pl.total_gross_weight_kg != null) {
                totalGrossWeight +=
                  parseFloat(String(pl.total_gross_weight_kg)) || 0
              }
              const vol = pl.total_cbm ?? pl.total_volume
              if (vol != null) {
                totalGrossVolume += parseFloat(String(vol)) || 0
              }
            })
          }
        }
      })
    }

    return {
      mblMawbNo: s.mbl_mawb_no ?? data?.mbl_mawb_no ?? "",
      vesselName: vesselOrAirline,
      voyageNo: voyageOrFlight,
      origin: orig,
      destination: dest,
      originPort: origPort,
      dischargePort: dischPort,
      finalPlaceOfDelivery: finalDeliv,
      estimatedTimeOfDelivery: etdVal,
      estimatedTimeOfArrival: etaVal,
      actualTimeOfDelivery: actualEtdVal,
      noOfPieces:
        totalCartonCount > 0
          ? String(totalCartonCount)
          : data?.no_pieces != null
            ? String(data.no_pieces)
            : "",
      totalPiecesCount: totalPiecesCount > 0 ? String(totalPiecesCount) : "",
      grossWeight:
        totalGrossWeight > 0
          ? Number.isInteger(totalGrossWeight)
            ? String(totalGrossWeight)
            : totalGrossWeight.toFixed(3)
          : data?.gross_weight != null
            ? String(data.gross_weight)
            : "",
      chargeableWeight:
        totalGrossVolume > 0
          ? Number.isInteger(totalGrossVolume)
            ? String(totalGrossVolume)
            : totalGrossVolume.toFixed(3)
          : data?.chargeable_weight != null
            ? String(data.chargeable_weight)
            : "",
      cbm:
        totalGrossVolume > 0
          ? Number.isInteger(totalGrossVolume)
            ? String(totalGrossVolume)
            : totalGrossVolume.toFixed(3)
          : data?.cbm != null
            ? String(data.cbm)
            : "",
    }
  }, [linkedShipment, data])

  if (isLoading) return <div className="p-6">Loading…</div>
  if (isError || !data) return <div className="p-6">Not found</div>

  const getParty = (prefix: string) => {
    const nested = (data as any)[prefix]
    if (!nested || typeof nested !== "object") {
      return {
        id: undefined,
        name: undefined,
        address: undefined,
        contactNo: undefined,
        email: undefined,
      }
    }
    return {
      id: nested.id,
      name: nested.name,
      address: nested.address,
      contactNo: nested.contact_no || nested.contactNo || nested.phone,
      email: nested.email,
    }
  }

  const clientParty = getParty("client")
  const manufactureParty = getParty("manufacture")
  const shipper = getParty("shipper")
  const consignee = getParty("consignee")
  const notifyParty = getParty("notify")

  const PartyDetails = ({ party }: { party: any }) => {
    if (!party) return null
    return (
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-md border border-neutral-700 bg-[#0A0A0A] p-3 text-xs text-zinc-300">
        <div>
          <span className="text-zinc-500">Name: </span>
          {party.name || "-"}
        </div>
        <div>
          <span className="text-zinc-500">Address: </span>
          {party.address || "-"}
        </div>
        <div>
          <span className="text-zinc-500">Contact No: </span>
          {party.contactNo || "-"}
        </div>
        <div>
          <span className="text-zinc-500">E-mail: </span>
          {party.email || "-"}
        </div>
      </div>
    )
  }

  const inputClass =
    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm font-semibold text-zinc-100 placeholder:text-zinc-500 focus-visible:outline-none cursor-default opacity-100 disabled:opacity-100"

  const type = data.type ?? (linkedShipment?.flight_number ? "AIR" : "SEA")
  const status = data.status ?? "saved"

  const renderDateField = (
    label: string,
    id: string,
    val: string,
    placeholder = "No shipment selected"
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild disabled={true}>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-semibold text-zinc-100 disabled:opacity-100 cursor-default",
              !val && "text-zinc-500"
            )}
          >
            {val
              ? (() => {
                const selectedDate = parseDate(val)
                return selectedDate ? format(selectedDate, "PPP") : val
              })()
              : placeholder}
            <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
      </Popover>
    </div>
  )

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`HBL-${data.house_bl_no || id}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "HBL / HAWB", href: "/hbl-hawb" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        {status.trim().toLowerCase() === "completed" ||
        status.trim().toLowerCase() === "completed_hbl" ? (
          <Button className="rounded-md" disabled>
            Edit
          </Button>
        ) : (
          <Link href={`/hbl-hawb/${id}/edit`}>
            <Button className="rounded-md">Edit</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Core shipment information and transport mode
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {renderDateField("Date", "date", data.date ?? "", "Pick a date")}

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Type
                </Label>
                <Select value={type} disabled>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 opacity-100 disabled:opacity-100">
                    <SelectValue placeholder="Choose Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    <SelectItem value="SEA">Sea</SelectItem>
                    <SelectItem value="AIR">Air</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Status
                </Label>
                <Select value={status} disabled>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 opacity-100 disabled:opacity-100">
                    <SelectValue placeholder="Choose Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    <SelectItem value="saved">Saved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Parties & References
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Customer information and shipment references
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Client
                </Label>
                <Input
                  value={clientParty.name || "—"}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Manufacturer
                </Label>
                <Input
                  value={manufactureParty.name || "—"}
                  readOnly
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
                  placeholder="Selected shipment MBL / MAWB No"
                  value={shipmentValues.mblMawbNo}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="house-bl-no"
                  className="text-xs font-medium text-foreground"
                >
                  House BL No
                </Label>
                <Input
                  id="house-bl-no"
                  placeholder="Enter House BL No"
                  value={data.house_bl_no ?? ""}
                  readOnly
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              HBL Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Shipper, consignee and notify party details for the house bill
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Shipper&apos;s Name
                </Label>
                <Input
                  value={shipper.name || shipper.id || "—"}
                  readOnly
                  className={inputClass}
                />
                <PartyDetails party={shipper} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Consignee&apos;s Name
                </Label>
                <Input
                  value={consignee.name || consignee.id || "—"}
                  readOnly
                  className={inputClass}
                />
                <PartyDetails party={consignee} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Notify&apos;s Name
                </Label>
                <Input
                  value={notifyParty.name || notifyParty.id || "—"}
                  readOnly
                  className={inputClass}
                />
                <PartyDetails party={notifyParty} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">Shipments</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of available planned shipments
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <ShipmentSelectionTable
                shipments={linkedShipment ? [linkedShipment] : []}
                selectedIds={selectedShipmentIds}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Vessel & Schedule
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Vessel details and shipment timeline
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {type === "AIR" ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="flight-number"
                      className="text-xs font-medium text-foreground"
                    >
                      Flight Number
                    </Label>
                    <Input
                      id="flight-number"
                      placeholder="Selected shipment Flight Number"
                      value={shipmentValues.voyageNo || shipmentValues.vesselName}
                      readOnly
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="air-origin"
                      className="text-xs font-medium text-foreground"
                    >
                      Origin
                    </Label>
                    <Input
                      id="air-origin"
                      placeholder="Selected shipment Origin"
                      value={shipmentValues.origin}
                      readOnly
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="air-destination"
                      className="text-xs font-medium text-foreground"
                    >
                      Destination
                    </Label>
                    <Input
                      id="air-destination"
                      placeholder="Selected shipment Destination"
                      value={shipmentValues.destination}
                      readOnly
                      className={inputClass}
                    />
                  </div>

                  {renderDateField(
                    "ETD - Origin",
                    "estimated-time-of-delivery",
                    shipmentValues.estimatedTimeOfDelivery
                  )}

                  {renderDateField(
                    "ETA - Destination",
                    "estimated-time-of-arrival",
                    shipmentValues.estimatedTimeOfArrival
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="vessel-name"
                      className="text-xs font-medium text-foreground"
                    >
                      Vessel Name
                    </Label>
                    <Input
                      id="vessel-name"
                      placeholder="Selected shipment Vessel Name"
                      value={shipmentValues.vesselName}
                      readOnly
                      className={inputClass}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="voyage-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Voyage No
                    </Label>
                    <Input
                      id="voyage-no"
                      placeholder="Selected shipment Voyage No"
                      value={shipmentValues.voyageNo}
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
                      placeholder="Selected shipment Origin Port"
                      value={shipmentValues.originPort || shipmentValues.origin}
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
                      placeholder="Selected shipment Discharge Port"
                      value={
                        shipmentValues.dischargePort ||
                        shipmentValues.destination
                      }
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
                      placeholder="Selected shipment Final Place of Delivery"
                      value={
                        shipmentValues.finalPlaceOfDelivery ||
                        shipmentValues.destination
                      }
                      readOnly
                      className={inputClass}
                    />
                  </div>

                  {renderDateField(
                    "ETD - Colombo",
                    "estimated-time-of-delivery",
                    shipmentValues.estimatedTimeOfDelivery
                  )}

                  {renderDateField(
                    "ETA Final Delivery Place",
                    "actual-time-of-delivery",
                    shipmentValues.actualTimeOfDelivery,
                    "Pick a date"
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Cargo Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Cargo measurements and destination details
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="total-freight-cost"
                  className="text-xs font-medium text-foreground"
                >
                  Total Freight Cost ($)
                </Label>
                <Input
                  id="total-freight-cost"
                  placeholder="Enter Total Freight Cost"
                  value={data.total_freight_cost ?? ""}
                  type="number"
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="total-carton-count"
                  className="text-xs font-medium text-foreground"
                >
                  Total Carton Count
                </Label>
                <Input
                  id="total-carton-count"
                  placeholder=" Total Carton Count"
                  value={shipmentValues.noOfPieces}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="total-pieces-count"
                  className="text-xs font-medium text-foreground"
                >
                  Total Pieces Count
                </Label>
                <Input
                  id="total-pieces-count"
                  placeholder=" Total Pieces Count"
                  value={shipmentValues.totalPiecesCount}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gross-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Total Gross Weight
                </Label>
                <Input
                  id="gross-weight"
                  placeholder="Total Gross Weight"
                  value={shipmentValues.grossWeight}
                  readOnly
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="total-volume"
                  className="text-xs font-medium text-foreground"
                >
                  Total Volume
                </Label>
                <Input
                  id="total-volume"
                  placeholder=" Total Volume"
                  value={
                    shipmentValues.chargeableWeight || shipmentValues.cbm
                  }
                  readOnly
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Additional Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Packing lists and carton quantities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Remarks
                </Label>
                <Textarea
                  placeholder="Type your message here."
                  value={data.remarks ?? ""}
                  readOnly
                  className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 cursor-default opacity-100 disabled:opacity-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Additional Port Information
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Packing lists and carton quantities.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {(Array.isArray(data.ports) && data.ports.length > 0
                ? data.ports
                : [{ id: 1, port: data.arrival_port || "" }]
              ).map((port: any, idx: number) => (
                <div key={port.id ?? idx} className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label
                      htmlFor={`port-${port.id ?? idx}`}
                      className="text-xs font-medium text-foreground"
                    >
                      Arrival Port
                    </Label>
                    <Input
                      id={`port-${port.id ?? idx}`}
                      placeholder="Enter port name"
                      value={port.port || port.value || ""}
                      readOnly
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
