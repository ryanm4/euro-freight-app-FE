"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import {
  fetchBillOfLadingById,
  updateBillOfLading,
} from "@/lib/api/bill_of_lading"
import { fetchClients } from "@/lib/api/clients"
import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconCalendarFilled, IconPlus, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import GRNTable, { GRN } from "../../_components/GRNTable"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"

interface Port {
  id: number
  value: string
}

// Shared parser for the various date-ish string formats coming back from
// the API (yyyy-MM-dd HH:mm:ss, yyyy-MM-dd, or full ISO).
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

const toDateInputValue = (val?: string | null) =>
  val ? String(val).slice(0, 10) : ""

export default function HBLHABWEdit() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const {
    data: res,
    isLoading: isLoadingHbl,
    isError,
  } = useQuery({
    queryKey: ["hbl-hawb", id],
    queryFn: () => fetchBillOfLadingById(id),
    enabled: !!id,
  })

  const [type, setType] = useState("")
  const [hblId, setHblId] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
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
  const [status, setStatus] = useState("saved")
  const [total_freight_cost, setTotalFreightCost] = useState("")

  const [shipperId, setShipperId] = useState("")
  const [consigneeId, setConsigneeId] = useState("")
  const [notifyId, setNotifyId] = useState("")

  const [grnTableData, setGrnTableData] = useState<GRN[]>([])
  const [shipmentData, setShipmentData] = useState<any>(null)
  const [packingList, setPackingList] = useState<any[]>([])

  const [selectedGrnIds, setSelectedGrnIds] = useState<Set<number>>(new Set())
  const [ports, setPorts] = useState<Port[]>([{ id: 1, value: "" }])

  // Populate the form once the HBL/HAWB record loads
  useEffect(() => {
    if (!res?.data) return
    const hbl = res.data
    setHblId(hbl.id ?? "")
    setType(hbl.type ?? "")
    setDate(
      hbl.date ? toDateInputValue(hbl.date) : format(new Date(), "yyyy-MM-dd")
    )
    setClient(hbl.client?.id != null ? String(hbl.client.id) : "")
    setManufacturer(
      hbl.manufacture?.id != null ? String(hbl.manufacture.id) : ""
    )
    setMblMawbNo(hbl.mbl_mawb_no ?? "")
    setVesselName(hbl.planned_vessel_name ?? "")
    setVoyageNo(hbl.voyage_no ?? "")
    setEstimatedTimeOfDelivery(toDateInputValue(hbl.etd))
    setEstimatedTimeOfArrival(toDateInputValue(hbl.eta))
    setActualTimeOfDelivery(toDateInputValue(hbl.actual_etd))
    setActualTimeOfArrival(toDateInputValue(hbl.actual_eta))
    setArrivalPort(hbl.arrival_port ?? "")
    setInlandLocation(hbl.inland_location ?? "")
    setNoOfPieces(hbl.no_pieces != null ? String(hbl.no_pieces) : "")
    setGrossWeight(hbl.gross_weight ?? "")
    setChargeableWeight(hbl.chargeable_weight ?? "")
    setCbm(hbl.cbm ?? "")
    setContainerSealNo(hbl.container_seal_no ?? "")
    setOnboardedDate(toDateInputValue(hbl.onboard_date))
    setRemarks(hbl.remarks ?? "")
    setStatus(hbl.status ?? "saved")
    setTotalFreightCost(hbl.total_freight_cost ?? "")
    setGrnTableData(hbl.grns ?? [])
    setShipmentData(hbl.shipment ?? null)
    setPackingList(hbl.grns ?? [])

    setShipperId(hbl.shipper?.id != null ? String(hbl.shipper.id) : "")
    setConsigneeId(hbl.consignee?.id != null ? String(hbl.consignee.id) : "")
    setNotifyId(hbl.notify?.id != null ? String(hbl.notify.id) : "")

    const grnIds = (hbl.grns ?? []).map((g: any) => g.id)
    setSelectedGrnIds(new Set(grnIds))

    // The sample payload doesn't show a stored ports list, so fall back to
    // arrival_port as the first entry if no dedicated ports array exists.
    if (Array.isArray(hbl.ports) && hbl.ports.length > 0) {
      setPorts(
        hbl.ports.map((p: any, idx: number) => ({
          id: p.id ?? idx + 1,
          value: p.value ?? "",
        }))
      )
    }
  }, [res?.data])

  // FCL and LCL are both sea freight; AIR is the only air mode.
  const shipmentMode = useMemo(() => {
    if (!type) return undefined
    return type === "AIR" ? "AIR" : "SEA"
  }, [type])

  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const { data: grnData } = useQuery({
    queryKey: ["grns", "COMPLETED", shipmentMode],
    queryFn: () => fetchGRNs("COMPLETED", shipmentMode),
    enabled: !!shipmentMode,
  })

  const clientOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Client) || []
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Supplier) || []
  }, [data])

  const shipperOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Forwarder) || []
  }, [data])

  const consigneeOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Consignee) || []
  }, [data])

  const notifierOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Notifier) || []
  }, [data])

  const partyOptions = useMemo(() => data?.data || [], [data])

  const shipper = useMemo(
    () => partyOptions.find((p: any) => String(p.id) === String(shipperId)),
    [partyOptions, shipperId]
  )
  const consignee = useMemo(
    () => partyOptions.find((p: any) => String(p.id) === String(consigneeId)),
    [partyOptions, consigneeId]
  )
  const notifyParty = useMemo(
    () => partyOptions.find((p: any) => String(p.id) === String(notifyId)),
    [partyOptions, notifyId]
  )

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
    if (!mblMawbNo || mblMawbNo.trim() === "") {
      alert("MBL/MAWB No is required.")
      return
    }

    setIsSaving(true)
    try {
      await updateBillOfLading(id, {
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
        actualTimeOfDelivery,
        actualTimeOfArrival,
        selectedGrnIds,
        ports,
        status,
        shipperId,
        consigneeId,
        notifyId,
        total_freight_cost,
      })
      router.push("/hbl-hawb")
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

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
          {party.contactNo || party.contact_no || party.phone || "-"}
        </div>
        <div>
          <span className="text-zinc-500">E-mail: </span>
          {party.email || "-"}
        </div>
      </div>
    )
  }

  if (isLoadingHbl) {
    return <div>Loading…</div>
  }

  if (isError || !res?.data) {
    return <>Not found</>
  }

  const totals = (packingList ?? []).reduce(
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

  const dateField = (
    label: string,
    id: string,
    value: string,
    onChange: (v: string) => void,
    disabled = false
  ) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
              disabled && "disabled:opacity-100",
              !value && "text-zinc-500"
            )}
          >
            {value
              ? (() => {
                  const d = parseDate(value)
                  return d ? format(d, "PPP") : "Pick a date"
                })()
              : "Pick a date"}
            <IconCalendarFilled className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={parseDate(value)}
            onSelect={(selectedDate) => {
              if (selectedDate) onChange(format(selectedDate, "yyyy-MM-dd"))
            }}
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
    </div>
  )

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          // title={`HBL/HAWB-${id}`}
          title={`HBL-${hblId ?? ""}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "HBL / HAWB", href: "/hbl-hawb" },
          ]}
        />
      </div>
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
              {dateField("Date", "date", date, setDate, false)}

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
                <Label className="text-xs font-medium text-foreground">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus} disabled>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    <SelectItem value="SHIPMENT_OPEN">SHIPMENT OPEN</SelectItem>
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
                <Select value={client} onValueChange={setClient}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Client" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {clientOptions.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
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
                      <SelectItem key={m.id} value={String(m.id)}>
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
                <Select value={shipperId} onValueChange={setShipperId}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Shipper" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {shipperOptions.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PartyDetails party={shipper} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Consignee&apos;s Name
                </Label>
                <Select value={consigneeId} onValueChange={setConsigneeId}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Consignee" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {consigneeOptions.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <PartyDetails party={consignee} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Notify&apos;s Name
                </Label>
                <Select value={notifyId} onValueChange={setNotifyId}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Notify Party" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {notifierOptions.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                grns={(grnTableData ?? []) as GRN[]}
                selectedIds={selectedGrnIds}
                onToggle={toggleGrn}
                selectedType={type}
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
            {type === "AIR" ? (
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
                    value={shipmentData?.flight_number}
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
                    value={shipmentData?.origin}
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
                    value={shipmentData?.destination}
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
                          !shipmentData?.etd_origin && "text-zinc-500"
                        )}
                      >
                        {shipmentData?.etd_origin
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
                                shipmentData?.etd_origin
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
                          return parseDate(shipmentData?.etd_origin)
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
                          !shipmentData?.eta_destination && "text-zinc-500"
                        )}
                      >
                        {shipmentData?.eta_destination
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
                                shipmentData?.eta_destination
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
                          return parseDate(shipmentData?.eta_destination)
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
                    value={shipmentData?.vessel_name}
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
                    value={shipmentData?.voyage_number}
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
                    value={shipmentData?.origin_port}
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
                    value={shipmentData?.discharge_port}
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
                    value={shipmentData?.final_place_of_delivery}
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
                          !shipmentData?.etd_colombo && "text-zinc-500"
                        )}
                      >
                        {shipmentData?.etd_colombo
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
                                shipmentData?.etd_colombo
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
                          return parseDate(shipmentData?.etd_colombo)
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
                          !shipmentData?.discharge_port && "text-zinc-500"
                        )}
                      >
                        {shipmentData?.discharge_port
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
                                shipmentData?.discharge_port
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
                          return parseDate(shipmentData?.discharge_port)
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
                          !shipmentData?.eta_final_delivery_place &&
                            "text-zinc-500"
                        )}
                      >
                        {shipmentData?.eta_final_delivery_place
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
                                shipmentData?.eta_final_delivery_place
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
                            shipmentData?.eta_final_delivery_place
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
                value={total_freight_cost}
                onChange={(e) => setTotalFreightCost(e.target.value)}
                type="number"
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
