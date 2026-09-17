"use client"
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
import { cn } from "@/lib/utils"
import { IconCalendarFilled, IconPlus, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useParams } from "next/navigation"
import type { GRN } from "../_components/GRNTable"
import GRNTable from "../_components/GRNTable"
import { useMemo } from "react"

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

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data

  const totals = (data.grns ?? []).reduce(
    (
      acc: {
        total_quantity: number
        total_cartons: number
        weight_kg: number
        total_volume: number
        total_cbm: number
      },
      grn: any
    ) => {
      const packingLists = grn.packing_lists ?? []

      packingLists.forEach((item: any) => {
        acc.total_quantity += Number(item.total_quantity) || 0
        acc.total_cartons += Number(item.total_cartons) || 0
        acc.weight_kg += Number(item.weight_kg) || 0
        acc.total_volume += Number(item.total_volume) || 0
        acc.total_cbm += Number(item.total_cbm) || 0
      })
      return acc
    },
    {
      total_quantity: 0,
      total_cartons: 0,
      weight_kg: 0,
      total_volume: 0,
      total_cbm: 0,
    }
  )

  // client, manufacture, shipper, consignee, and notify all come back as
  // nested objects: { id, name, address }. Contact No / E-mail aren't part
  // of the payload yet, so those fields fall back to "—" until the API
  // includes them.
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

  // Read-only details panel (Address / Contact No / E-mail) for a party.
  const PartyDetails = ({ party }: { party: any }) => {
    if (!party || (!party.address && !party.contactNo && !party.email)) {
      return null
    }
    return (
      <div className="mt-2 grid grid-cols-1 gap-y-2 rounded-md border border-neutral-700 bg-[#0A0A0A] p-3 text-xs text-zinc-300">
        <div>
          <span className="text-zinc-500">Address: </span>
          {party.address || "—"}
        </div>
        <div>
          <span className="text-zinc-500">Contact No: </span>
          {party.contactNo || "—"}
        </div>
        <div>
          <span className="text-zinc-500">E-mail: </span>
          {party.email || "—"}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          // title={`HBL/HAWB-${id}`}
          title={`HBL/HAWB`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "HBL / HAWB", href: "/hbl-hawb" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" disabled>
          Edit
        </Button>
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
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Type
                </Label>
                <Select value={data.type} disabled>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    <SelectItem value="SEA">Sea</SelectItem>
                    <SelectItem value="AIR">Air</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="date"
                  className="text-xs font-medium text-foreground"
                >
                  Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild disabled={true}>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !data.date && "text-zinc-500"
                      )}
                    >
                      {data.date
                        ? (() => {
                            const parseDate = (
                              val: string
                            ): Date | undefined => {
                              if (!val) return undefined
                              let d = parse(
                                val,
                                "yyyy-MM-dd HH:mm:ss",
                                new Date()
                              )
                              if (isValid(d)) return d
                              d = parse(val, "yyyy-MM-dd", new Date())
                              if (isValid(d)) return d
                              d = new Date(val)
                              if (isValid(d)) return d
                              return undefined
                            }
                            const selectedDate = parseDate(data.date)
                            return selectedDate
                              ? format(selectedDate, "PPP")
                              : "Pick a date"
                          })()
                        : "Pick a date"}
                      <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
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
                        return parseDate(data.date)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
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

                <div className="flex h-9 w-full items-center rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100">
                  {clientParty.name || "—"}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Manufacturer
                </Label>

                <div className="flex h-9 w-full items-center rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100">
                  {manufactureParty.name || "—"}
                </div>
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
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                <div className="flex h-9 w-full items-center rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100">
                  {shipper.name || shipper.id || "—"}
                </div>
                <PartyDetails party={shipper} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Consignee&apos;s Name
                </Label>
                <div className="flex h-9 w-full items-center rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100">
                  {consignee.name || consignee.id || "—"}
                </div>
                <PartyDetails party={consignee} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Notify&apos;s Name
                </Label>
                <div className="flex h-9 w-full items-center rounded-md border border-zinc-700 bg-[#0A0A0A] px-3 text-sm text-zinc-100">
                  {notifyParty.name || notifyParty.id || "—"}
                </div>
                <PartyDetails party={notifyParty} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">GRNs</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of available Goods Received Notes
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <GRNTable
                grns={(data.grns ?? []) as GRN[]}
                selectedIds={data.selectedGrnIds}
                onToggle={data.toggleGrn}
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
            {data.type === "AIR" ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="vessel-name"
                    className="text-xs font-medium text-foreground"
                  >
                    Flight Number
                  </Label>
                  <Input
                    id="flight-number"
                    placeholder="Enter Flight Number"
                    value={data.shipment.flight_number}
                    disabled={true}
                    // onChange={(e) => setVesselName(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="vessel-name"
                    className="text-xs font-medium text-foreground"
                  >
                    Origin
                  </Label>
                  <Input
                    id="flight-number"
                    placeholder="Enter Flight Number"
                    value={data.shipment.origin}
                    disabled={true}
                    // onChange={(e) => setVesselName(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="vessel-name"
                    className="text-xs font-medium text-foreground"
                  >
                    Destination
                  </Label>
                  <Input
                    id="flight-number"
                    placeholder="Enter Flight Number"
                    value={data.shipment.destination}
                    disabled={true}
                    // onChange={(e) => setVesselName(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="estimated-time-of-delivery"
                    className="text-xs font-medium text-foreground"
                  >
                    ETD - Origin
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild disabled={true}>
                      <Button
                        id="estimated-time-of-delivery"
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                          !data.shipment.etd_origin && "text-zinc-500"
                        )}
                      >
                        {data.shipment.etd_origin
                          ? (() => {
                              const parseDate = (
                                val: string
                              ): Date | undefined => {
                                if (!val) return undefined
                                let d = parse(
                                  val,
                                  "yyyy-MM-dd HH:mm:ss",
                                  new Date()
                                )
                                if (isValid(d)) return d
                                d = parse(val, "yyyy-MM-dd", new Date())
                                if (isValid(d)) return d
                                d = new Date(val)
                                if (isValid(d)) return d
                                return undefined
                              }
                              const selectedDate = parseDate(
                                data.shipment.etd_origin
                              )
                              return selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"
                            })()
                          : "Pick a date"}
                        <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={(() => {
                          const parseDate = (val: string): Date | undefined => {
                            if (!val) return undefined
                            let d = parse(
                              val,
                              "yyyy-MM-dd HH:mm:ss",
                              new Date()
                            )
                            if (isValid(d)) return d
                            d = parse(val, "yyyy-MM-dd", new Date())
                            if (isValid(d)) return d
                            d = new Date(val)
                            if (isValid(d)) return d
                            return undefined
                          }
                          return parseDate(data.shipment.etd_origin)
                        })()}
                        // onSelect={(selectedDate) => {
                        //   if (selectedDate) {
                        //     data.shipment.etd_origin(
                        //       format(selectedDate, "yyyy-MM-dd")
                        //     )
                        //   }
                        // }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="estimated-time-of-delivery"
                    className="text-xs font-medium text-foreground"
                  >
                    ETA - Destination
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild disabled={true}>
                      <Button
                        id="estimated-time-of-delivery"
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                          !data.shipment.eta_destination && "text-zinc-500"
                        )}
                      >
                        {data.shipment.eta_destination
                          ? (() => {
                              const parseDate = (
                                val: string
                              ): Date | undefined => {
                                if (!val) return undefined
                                let d = parse(
                                  val,
                                  "yyyy-MM-dd HH:mm:ss",
                                  new Date()
                                )
                                if (isValid(d)) return d
                                d = parse(val, "yyyy-MM-dd", new Date())
                                if (isValid(d)) return d
                                d = new Date(val)
                                if (isValid(d)) return d
                                return undefined
                              }
                              const selectedDate = parseDate(
                                data.shipment.eta_destination
                              )
                              return selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"
                            })()
                          : "Pick a date"}
                        <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={(() => {
                          const parseDate = (val: string): Date | undefined => {
                            if (!val) return undefined
                            let d = parse(
                              val,
                              "yyyy-MM-dd HH:mm:ss",
                              new Date()
                            )
                            if (isValid(d)) return d
                            d = parse(val, "yyyy-MM-dd", new Date())
                            if (isValid(d)) return d
                            d = new Date(val)
                            if (isValid(d)) return d
                            return undefined
                          }
                          return parseDate(data.shipment.eta_destination)
                        })()}
                        // onSelect={(selectedDate) => {
                        //   if (selectedDate) {
                        //     setEstimatedTimeOfDelivery(
                        //       format(selectedDate, "yyyy-MM-dd")
                        //     )
                        //   }
                        // }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
                    placeholder="Enter Vessel Name"
                    value={data.shipment.vessel_name}
                    disabled={true}
                    // onChange={(e) => setVesselName(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                    placeholder="Enter Voyage No"
                    value={data.shipment.voyage_number}
                    disabled={true}
                    // onChange={(e) => setVoyageNo(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                    value={data.shipment.origin_port}
                    disabled={true}
                    // onChange={(e) => setVoyageNo(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="discharge  -port"
                    className="text-xs font-medium text-foreground"
                  >
                    Discharge Port
                  </Label>
                  <Input
                    id="discharge-port"
                    placeholder="Enter Discharge Port"
                    value={data.shipment.discharge_port}
                    disabled={true}
                    // onChange={(e) => setVoyageNo(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                    value={data.shipment.final_place_of_delivery}
                    disabled={true}
                    // onChange={(e) => setVoyageNo(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="estimated-time-of-delivery"
                    className="text-xs font-medium text-foreground"
                  >
                    ETD - Colombo
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild disabled={true}>
                      <Button
                        id="estimated-time-of-delivery"
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                          !data.shipment.etd_colombo && "text-zinc-500"
                        )}
                      >
                        {data.shipment.etd_colombo
                          ? (() => {
                              const parseDate = (
                                val: string
                              ): Date | undefined => {
                                if (!val) return undefined
                                let d = parse(
                                  val,
                                  "yyyy-MM-dd HH:mm:ss",
                                  new Date()
                                )
                                if (isValid(d)) return d
                                d = parse(val, "yyyy-MM-dd", new Date())
                                if (isValid(d)) return d
                                d = new Date(val)
                                if (isValid(d)) return d
                                return undefined
                              }
                              const selectedDate = parseDate(
                                data.shipment.etd_colombo
                              )
                              return selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"
                            })()
                          : "Pick a date"}
                        <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={(() => {
                          const parseDate = (val: string): Date | undefined => {
                            if (!val) return undefined
                            let d = parse(
                              val,
                              "yyyy-MM-dd HH:mm:ss",
                              new Date()
                            )
                            if (isValid(d)) return d
                            d = parse(val, "yyyy-MM-dd", new Date())
                            if (isValid(d)) return d
                            d = new Date(val)
                            if (isValid(d)) return d
                            return undefined
                          }
                          return parseDate(data.shipment.etd_colombo)
                        })()}
                        // onSelect={(selectedDate) => {
                        //   if (selectedDate) {
                        //     setEstimatedTimeOfDelivery(
                        //       format(selectedDate, "yyyy-MM-dd")
                        //     )
                        //   }
                        // }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="estimated-time-of-arrival"
                    className="text-xs font-medium text-foreground"
                  >
                    ETA -Discharge Port
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild disabled={true}>
                      <Button
                        id="estimated-time-of-arrival"
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                          !data.shipment.discharge_port && "text-zinc-500"
                        )}
                      >
                        {data.shipment.discharge_port
                          ? (() => {
                              const parseDate = (
                                val: string
                              ): Date | undefined => {
                                if (!val) return undefined
                                let d = parse(
                                  val,
                                  "yyyy-MM-dd HH:mm:ss",
                                  new Date()
                                )
                                if (isValid(d)) return d
                                d = parse(val, "yyyy-MM-dd", new Date())
                                if (isValid(d)) return d
                                d = new Date(val)
                                if (isValid(d)) return d
                                return undefined
                              }
                              const selectedDate = parseDate(
                                data.shipment.discharge_port
                              )
                              return selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"
                            })()
                          : "Pick a date"}
                        <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={(() => {
                          const parseDate = (val: string): Date | undefined => {
                            if (!val) return undefined
                            let d = parse(
                              val,
                              "yyyy-MM-dd HH:mm:ss",
                              new Date()
                            )
                            if (isValid(d)) return d
                            d = parse(val, "yyyy-MM-dd", new Date())
                            if (isValid(d)) return d
                            d = new Date(val)
                            if (isValid(d)) return d
                            return undefined
                          }
                          return parseDate(data.shipment.discharge_port)
                        })()}
                        // onSelect={(selectedDate) => {
                        //   if (selectedDate) {
                        //     setEstimatedTimeOfArrival(
                        //       format(selectedDate, "yyyy-MM-dd")
                        //     )
                        //   }
                        // }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="actual-time-of-delivery"
                    className="text-xs font-medium text-foreground"
                  >
                    ETA Final Delivery Place
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild disabled={true}>
                      <Button
                        id="actual-time-of-delivery"
                        variant="outline"
                        className={cn(
                          "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                          !data.shipment.eta_final_delivery_place &&
                            "text-zinc-500"
                        )}
                      >
                        {data.shipment.eta_final_delivery_place
                          ? (() => {
                              const parseDate = (
                                val: string
                              ): Date | undefined => {
                                if (!val) return undefined
                                let d = parse(
                                  val,
                                  "yyyy-MM-dd HH:mm:ss",
                                  new Date()
                                )
                                if (isValid(d)) return d
                                d = parse(val, "yyyy-MM-dd", new Date())
                                if (isValid(d)) return d
                                d = new Date(val)
                                if (isValid(d)) return d
                                return undefined
                              }
                              const selectedDate = parseDate(
                                data.shipment.eta_final_delivery_place
                              )
                              return selectedDate
                                ? format(selectedDate, "PPP")
                                : "Pick a date"
                            })()
                          : "Pick a date"}
                        <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={(() => {
                          const parseDate = (val: string): Date | undefined => {
                            if (!val) return undefined
                            let d = parse(
                              val,
                              "yyyy-MM-dd HH:mm:ss",
                              new Date()
                            )
                            if (isValid(d)) return d
                            d = parse(val, "yyyy-MM-dd", new Date())
                            if (isValid(d)) return d
                            d = new Date(val)
                            if (isValid(d)) return d
                            return undefined
                          }
                          return parseDate(
                            data.shipment.eta_final_delivery_place
                          )
                        })()}
                        // onSelect={(selectedDate) => {
                        //   if (selectedDate) {
                        //     setActualTimeOfDelivery(
                        //       format(selectedDate, "yyyy-MM-dd")
                        //     )
                        //   }
                        // }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="vessel-name"
                  className="text-xs font-medium text-foreground"
                >
                  Planned Vessel Name
                </Label>
                <Input
                  id="vessel-name"
                  placeholder="Enter Vessel Name"
                  value={data.planned_vessel_name}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                  placeholder="Enter Voyage No"
                  value={data.voyage_no}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="estimated-time-of-delivery"
                  className="text-xs font-medium text-foreground"
                >
                  Estimated Time of Delivery
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="estimated-time-of-delivery"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !data.etd && "text-zinc-500"
                      )}
                    >
                      {data.etd
                        ? (() => {
                            const parseDate = (
                              val: string
                            ): Date | undefined => {
                              if (!val) return undefined
                              let d = parse(
                                val,
                                "yyyy-MM-dd HH:mm:ss",
                                new Date()
                              )
                              if (isValid(d)) return d
                              d = parse(val, "yyyy-MM-dd", new Date())
                              if (isValid(d)) return d
                              d = new Date(val)
                              if (isValid(d)) return d
                              return undefined
                            }
                            const selectedDate = parseDate(data.etd)
                            return selectedDate
                              ? format(selectedDate, "PPP")
                              : "Pick a date"
                          })()
                        : "Pick a date"}
                      <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
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
                        return parseDate(data.etd)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="estimated-time-of-arrival"
                  className="text-xs font-medium text-foreground"
                >
                  Estimated Time of Arrival
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="estimated-time-of-arrival"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !data.eta && "text-zinc-500"
                      )}
                    >
                      {data.eta
                        ? (() => {
                            const parseDate = (
                              val: string
                            ): Date | undefined => {
                              if (!val) return undefined
                              let d = parse(
                                val,
                                "yyyy-MM-dd HH:mm:ss",
                                new Date()
                              )
                              if (isValid(d)) return d
                              d = parse(val, "yyyy-MM-dd", new Date())
                              if (isValid(d)) return d
                              d = new Date(val)
                              if (isValid(d)) return d
                              return undefined
                            }
                            const selectedDate = parseDate(data.eta)
                            return selectedDate
                              ? format(selectedDate, "PPP")
                              : "Pick a date"
                          })()
                        : "Pick a date"}
                      <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
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
                        return parseDate(data.eta)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="actual-time-of-delivery"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Time of Delivery
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="actual-time-of-delivery"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !data.actual_etd && "text-zinc-500"
                      )}
                    >
                      {data.actual_etd
                        ? (() => {
                            const parseDate = (
                              val: string
                            ): Date | undefined => {
                              if (!val) return undefined
                              let d = parse(
                                val,
                                "yyyy-MM-dd HH:mm:ss",
                                new Date()
                              )
                              if (isValid(d)) return d
                              d = parse(val, "yyyy-MM-dd", new Date())
                              if (isValid(d)) return d
                              d = new Date(val)
                              if (isValid(d)) return d
                              return undefined
                            }
                            const selectedDate = parseDate(data.actual_etd)
                            return selectedDate
                              ? format(selectedDate, "PPP")
                              : "Pick a date"
                          })()
                        : "Pick a date"}
                      <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
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
                        return parseDate(data.actual_etd)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="actual-time-of-arrival"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Time of Arrival
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="actual-time-of-arrival"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !data.actual_eta && "text-zinc-500"
                      )}
                    >
                      {data.actual_eta
                        ? (() => {
                            const parseDate = (
                              val: string
                            ): Date | undefined => {
                              if (!val) return undefined
                              let d = parse(
                                val,
                                "yyyy-MM-dd HH:mm:ss",
                                new Date()
                              )
                              if (isValid(d)) return d
                              d = parse(val, "yyyy-MM-dd", new Date())
                              if (isValid(d)) return d
                              d = new Date(val)
                              if (isValid(d)) return d
                              return undefined
                            }
                            const selectedDate = parseDate(data.actual_eta)
                            return selectedDate
                              ? format(selectedDate, "PPP")
                              : "Pick a date"
                          })()
                        : "Pick a date"}
                      <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
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
                        return parseDate(data.actual_eta)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div> */}
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
              {/* <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="arrival-port"
                  className="text-xs font-medium text-foreground"
                >
                  Arrival Port
                </Label>
                <Input
                  id="arrival-port"
                  placeholder="Enter Arrival Port"
                  value={data.arrival_port}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div> */}

              {/* <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="inland-location"
                  className="text-xs font-medium text-foreground"
                >
                  Inland Location
                </Label>
                <Input
                  id="inland-location"
                  placeholder="Enter Inland Location"
                  value={data.inland_location}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div> */}

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="no-of-pieces"
                  className="text-xs font-medium text-foreground"
                >
                  Total Freight Cost ($)
                </Label>
                <Input
                  id="total-freight-cost"
                  placeholder="Enter Total Freight Cost"
                  value={data.total_freight_cost}
                  // onChange={(e) => setTotalFreightCost(e.target.value)}
                  type="number"
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="no-of-pieces"
                  className="text-xs font-medium text-foreground"
                >
                  Total Carton Count
                </Label>
                <Input
                  id="no-of-pieces"
                  placeholder="Enter No. of Pieces"
                  value={totals.total_cartons}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="no-of-pieces"
                  className="text-xs font-medium text-foreground"
                >
                  Total Pieces Count
                </Label>
                <Input
                  id="no-of-pieces"
                  placeholder="Enter No. of Pieces"
                  value={totals.total_quantity}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                  placeholder="Enter Gross Weight"
                  value={totals.weight_kg}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="chargeable-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Total Volume
                </Label>
                <Input
                  id="chargeable-weight"
                  placeholder="Enter Chargeable Weight"
                  value={totals.total_volume}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cbm"
                  className="text-xs font-medium text-foreground"
                >
                  Total Volume Weight
                </Label>
                <Input
                  id="cbm"
                  placeholder="Enter CBM"
                  value={totals.total_cbm}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              {/* <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="container-seal-no"
                  className="text-xs font-medium text-foreground"
                >
                  Container Seal No
                </Label>
                <Input
                  id="container-seal-no"
                  placeholder="Enter Container Seal No"
                  value={data.container_seal_no}
                  readOnly
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div> */}

              {/* <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="onboarded-date"
                  className="text-xs font-medium text-foreground"
                >
                  Onboarded date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="onboarded-date"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !data.onboard_date && "text-zinc-500"
                      )}
                    >
                      {data.onboard_date
                        ? (() => {
                            const parseDate = (
                              val: string
                            ): Date | undefined => {
                              if (!val) return undefined
                              let d = parse(
                                val,
                                "yyyy-MM-dd HH:mm:ss",
                                new Date()
                              )
                              if (isValid(d)) return d
                              d = parse(val, "yyyy-MM-dd", new Date())
                              if (isValid(d)) return d
                              d = new Date(val)
                              if (isValid(d)) return d
                              return undefined
                            }
                            const selectedDate = parseDate(data.onboard_date)
                            return selectedDate
                              ? format(selectedDate, "PPP")
                              : "Pick a date"
                          })()
                        : "Pick a date"}
                      <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => {
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
                        return parseDate(data.onboard_date)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div> */}
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
                  value={data.remarks}
                  readOnly
                  className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500"
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
            <button
              onClick={data.addPort}
              className="flex items-center gap-1.5 rounded-md border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:bg-neutral-700"
            >
              <IconPlus size={13} />
              Add Port
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {data.ports.map((port: any) => (
                <div key={port.id} className="flex items-end gap-2">
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Label
                      htmlFor={`port-${port.id}`}
                      className="text-xs font-medium text-foreground"
                    >
                      Arrival Port
                    </Label>
                    <Input
                      id={`port-${port.id}`}
                      placeholder="Enter port name"
                      value={port.port}
                      readOnly
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>
                  <button
                    disabled={data.ports.length === 1}
                    className="mb-0.5 flex items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 p-2 text-zinc-400 transition-colors hover:bg-neutral-700 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
