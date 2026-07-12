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
import { createBillOfLading } from "@/lib/api/bill_of_lading"
import { fetchClients } from "@/lib/api/clients"
import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { IconCalendarFilled, IconPlus, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import GRNTable, { GRN } from "./GRNTable"

interface Port {
  id: number
  value: string
}

export default function HBLHABWForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [type, setType] = useState("")
  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [mblMawbNo, setMblMawbNo] = useState("")
  const [vesselName, setVesselName] = useState("")
  const [estimatedTimeOfDelivery, setEstimatedTimeOfDelivery] = useState("")
  const [voyageNo, setVoyageNo] = useState("")
  const [estimatedTimeOfArrival, setEstimatedTimeOfArrival] = useState("")
  const [actualTimeOfArrival, setActualTimeOfArrival] = useState("")
  const [actualTimeOfDelivery, setActualTimeOfDelivery] = useState("")
  const [arrivalPort, setArrivalPort] = useState("")
  const [inlandLocation, setInlandLocation] = useState("")
  const [noOfPieces, setNoOfPieces] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [chargeableWeight, setChargeableWeight] = useState("")
  const [cbm, setCbm] = useState("")
  const [containerSealNo, setContainerSealNo] = useState("")
  const [onboardedDate, setOnboardedDate] = useState("")
  const [remarks, setRemarks] = useState("")
  // const [arrivalPorts, setArrivalPorts] = useState<Port[]>([])

  const [selectedGrnIds, setSelectedGrnIds] = useState<Set<number>>(new Set())

  const [ports, setPorts] = useState<Port[]>([{ id: 1, value: "" }])

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const {
    data: grnData,
    // isLoading,
    // error,
  } = useQuery({
    queryKey: ["grns"],
    queryFn: fetchGRNs,
  })
  // data={(data?.data ?? []) as GOODS_RECEIVE_NOTE[]}

  const clientOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Client) || []
    )
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Supplier) ||
      []
    )
  }, [data])

  const toggleGrn = (id: number) => {
    setSelectedGrnIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addPort = () => {
    setPorts((prev) => [...prev, { id: Date.now(), value: "" }])
  }

  const removePort = (id: number) => {
    setPorts((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePort = (id: number, value: string) => {
    setPorts((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await createBillOfLading({
        client,
        manufacturer,
        date,
        type,
        vesselName,
        voyageNo,
        estimatedTimeOfDelivery,
        estimatedTimeOfArrival,
        arrivalPort,
        inlandLocation,
        mblMawbNo,
        noOfPieces,
        grossWeight,
        chargeableWeight,
        cbm,
        containerSealNo,
        onboardedDate,
        selectedGrnIds,
        ports,
      })
      router.push("/hbl-hawb")
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
          variant="outline"
          className="rounded-md"
          onClick={() => router.push("/hbl-hawb")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" disabled={isSaving} onClick={handleSave}>
          {isSaving ? "Saving…" : "Save"}
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
                <Select value={type} onValueChange={setType}>
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
                        !date && "text-zinc-500"
                      )}
                    >
                      {date
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
                            const selectedDate = parseDate(date)
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
                        return parseDate(date)
                      })()}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setDate(format(selectedDate, "yyyy-MM-dd"))
                        }
                      }}
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
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Client" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {clientOptions.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Manufacturer
                </Label>
                <Select value={manufacturer} onValueChange={setManufacturer}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Manufacturer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {manufacturerOptions.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
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
                grns={(grnData?.data ?? []) as GRN[]}
                selectedIds={selectedGrnIds}
                onToggle={toggleGrn}
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
                  value={vesselName}
                  onChange={(e) => setVesselName(e.target.value)}
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
                  value={voyageNo}
                  onChange={(e) => setVoyageNo(e.target.value)}
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
                        !estimatedTimeOfDelivery && "text-zinc-500"
                      )}
                    >
                      {estimatedTimeOfDelivery
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
                              estimatedTimeOfDelivery
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
                        return parseDate(estimatedTimeOfDelivery)
                      })()}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setEstimatedTimeOfDelivery(
                            format(selectedDate, "yyyy-MM-dd")
                          )
                        }
                      }}
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
                        !estimatedTimeOfArrival && "text-zinc-500"
                      )}
                    >
                      {estimatedTimeOfArrival
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
                              estimatedTimeOfArrival
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
                        return parseDate(estimatedTimeOfArrival)
                      })()}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setEstimatedTimeOfArrival(
                            format(selectedDate, "yyyy-MM-dd")
                          )
                        }
                      }}
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
                        !actualTimeOfDelivery && "text-zinc-500"
                      )}
                    >
                      {actualTimeOfDelivery
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
                            const selectedDate = parseDate(actualTimeOfDelivery)
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
                        return parseDate(actualTimeOfDelivery)
                      })()}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setActualTimeOfDelivery(
                            format(selectedDate, "yyyy-MM-dd")
                          )
                        }
                      }}
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
                        !actualTimeOfArrival && "text-zinc-500"
                      )}
                    >
                      {actualTimeOfArrival
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
                            const selectedDate = parseDate(actualTimeOfArrival)
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
                        return parseDate(actualTimeOfArrival)
                      })()}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setActualTimeOfArrival(
                            format(selectedDate, "yyyy-MM-dd")
                          )
                        }
                      }}
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
                  value={arrivalPort}
                  onChange={(e) => setArrivalPort(e.target.value)}
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
                  value={inlandLocation}
                  onChange={(e) => setInlandLocation(e.target.value)}
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
                  value={noOfPieces}
                  onChange={(e) => setNoOfPieces(e.target.value)}
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
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
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
                  value={chargeableWeight}
                  onChange={(e) => setChargeableWeight(e.target.value)}
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
                  value={cbm}
                  onChange={(e) => setCbm(e.target.value)}
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
                  value={containerSealNo}
                  onChange={(e) => setContainerSealNo(e.target.value)}
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
                        !onboardedDate && "text-zinc-500"
                      )}
                    >
                      {onboardedDate
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
                            const selectedDate = parseDate(onboardedDate)
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
                        return parseDate(onboardedDate)
                      })()}
                      onSelect={(selectedDate) => {
                        if (selectedDate) {
                          setOnboardedDate(format(selectedDate, "yyyy-MM-dd"))
                        }
                      }}
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
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
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
              onClick={addPort}
              className="flex items-center gap-1.5 rounded-md border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:bg-neutral-700"
            >
              <IconPlus size={13} />
              Add Port
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {ports.map((port) => (
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
                      onChange={(e) => updatePort(port.id, e.target.value)}
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>
                  <button
                    onClick={() => removePort(port.id)}
                    disabled={ports.length === 1}
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
