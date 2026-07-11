"use client"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchBillOfLadingById } from "@/lib/api/bill_of_lading"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import GRNTable from "../_components/GRNTable"
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
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { IconCalendarFilled, IconPlus, IconTrash } from "@tabler/icons-react"
import { format, parse, isValid } from "date-fns"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchClients } from "@/lib/api/clients"
import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import type { GRN } from "../_components/GRNTable"

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
                <Select value={data.type}>
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
                  <PopoverTrigger asChild>
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
                <Select value={data.client_id}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Client" />
                  </SelectTrigger>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Manufacturer
                </Label>
                <Select value={data.manufacturer}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Manufacturer" />
                  </SelectTrigger>
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
                  value={data.mblMawbNo}
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
            <h2 className="text-sm font-semibold text-zinc-100">GRNs</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of available Goods Received Notes
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <GRNTable
                grns={(data.grnData?.data ?? []) as GRN[]}
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
            <div className="grid grid-cols-2 gap-4">
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
                  value={data.vesselName}
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
                  value={data.voyageNo}
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
                        !data.estimatedTimeOfDelivery && "text-zinc-500"
                      )}
                    >
                      {data.estimatedTimeOfDelivery
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
                              data.estimatedTimeOfDelivery
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
                          let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
                          if (isValid(d)) return d
                          d = parse(val, "yyyy-MM-dd", new Date())
                          if (isValid(d)) return d
                          d = new Date(val)
                          if (isValid(d)) return d
                          return undefined
                        }
                        return parseDate(data.estimatedTimeOfDelivery)
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
                        !data.estimatedTimeOfArrival && "text-zinc-500"
                      )}
                    >
                      {data.estimatedTimeOfArrival
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
                              data.estimatedTimeOfArrival
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
                          let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
                          if (isValid(d)) return d
                          d = parse(val, "yyyy-MM-dd", new Date())
                          if (isValid(d)) return d
                          d = new Date(val)
                          if (isValid(d)) return d
                          return undefined
                        }
                        return parseDate(data.estimatedTimeOfArrival)
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
                        !data.actualTimeOfDelivery && "text-zinc-500"
                      )}
                    >
                      {data.actualTimeOfDelivery
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
                              data.actualTimeOfDelivery
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
                          let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
                          if (isValid(d)) return d
                          d = parse(val, "yyyy-MM-dd", new Date())
                          if (isValid(d)) return d
                          d = new Date(val)
                          if (isValid(d)) return d
                          return undefined
                        }
                        return parseDate(data.actualTimeOfDelivery)
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
                        !data.actualTimeOfArrival && "text-zinc-500"
                      )}
                    >
                      {data.actualTimeOfArrival
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
                              data.actualTimeOfArrival
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
                          let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
                          if (isValid(d)) return d
                          d = parse(val, "yyyy-MM-dd", new Date())
                          if (isValid(d)) return d
                          d = new Date(val)
                          if (isValid(d)) return d
                          return undefined
                        }
                        return parseDate(data.actualTimeOfArrival)
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
                  htmlFor="arrival-port"
                  className="text-xs font-medium text-foreground"
                >
                  Arrival Port
                </Label>
                <Input
                  id="arrival-port"
                  placeholder="Enter Arrival Port"
                  value={data.arrivalPort}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="inland-location"
                  className="text-xs font-medium text-foreground"
                >
                  Inland Location
                </Label>
                <Input
                  id="inland-location"
                  placeholder="Enter Inland Location"
                  value={data.inlandLocation}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="no-of-pieces"
                  className="text-xs font-medium text-foreground"
                >
                  No. of Pieces
                </Label>
                <Input
                  id="no-of-pieces"
                  placeholder="Enter No. of Pieces"
                  value={data.noOfPieces}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gross-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Gross Weight
                </Label>
                <Input
                  id="gross-weight"
                  placeholder="Enter Gross Weight"
                  value={data.grossWeight}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="chargeable-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Chargeable Weight
                </Label>
                <Input
                  id="chargeable-weight"
                  placeholder="Enter Chargeable Weight"
                  value={data.hargeableWeight}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cbm"
                  className="text-xs font-medium text-foreground"
                >
                  CBM
                </Label>
                <Input
                  id="cbm"
                  placeholder="Enter CBM"
                  value={data.cbm}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="container-seal-no"
                  className="text-xs font-medium text-foreground"
                >
                  Container Seal No
                </Label>
                <Input
                  id="container-seal-no"
                  placeholder="Enter Container Seal No"
                  value={data.containerSealNo}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
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
                        !data.onboardedDate && "text-zinc-500"
                      )}
                    >
                      {data.onboardedDate
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
                            const selectedDate = parseDate(data.onboardedDate)
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
                        return parseDate(data.onboardedDate)
                      })()}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
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
                  value={data.remarks}
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
                      value={port.value}
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
