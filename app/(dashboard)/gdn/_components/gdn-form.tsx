"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { fetchClients } from "@/lib/api/clients"
import { fetchDrivers } from "@/lib/api/drivers"
import { createGoodsDispatchNote } from "@/lib/api/goods_dispatch_notes"
import { fetchPackingLists } from "@/lib/api/packing_lists"
import { fetchWharfStaff } from "@/lib/api/wharf_staff"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { IconCalendarFilled } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

interface PackingListRow {
  id: number
  packingListNo: string
  clientId: number | null
  clientName: string
  forwarderId: number | null
  forwarderName: string
  poNumber: string
  date: string
  quantity: number
  gdnNo: string
  status: string
}

const DISPATCH_LOCATION_OPTIONS = [
  { label: "Airport – Katunayaka", value: "Katunayaka Airport" },
  { label: "Sea Port – Colombo Port", value: "Colombo Port" },
  {
    label: "Consolidator's Warehouse – ACE Yard",
    value: "ACE Yard",
  },
]

const TRANSPORT_MODE_OPTIONS = ["FCL container", "Loose cargo"]

const CONTAINER_SIZE_OPTIONS = ["20GP", "40GP", "40HC"]

const CUSTOM_DOC_STATUS_OPTIONS = ["Pending", "In Progress", "Completed"]

const STATUS_OPTIONS = ["Draft", "Saved", "Completed"]

export default function GoodsDispatchNoteForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [date, setDate] = useState("")
  const [gdnReference, setGdnReference] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [driver, setDriver] = useState("")
  const [wharfStaff, setWharfStaff] = useState("")
  const [deliveredTo, setDeliveredTo] = useState("")
  const [transportMode, setTransportMode] = useState("")
  const [containerNo, setContainerNo] = useState("")
  const [containerSize, setContainerSize] = useState("")
  const [primarySealNo, setPrimarySealNo] = useState("")
  const [secondarySealNo, setSecondarySealNo] = useState("")
  const [customDocStatus, setCustomDocStatus] = useState("")
  const [status, setStatus] = useState("")
  // const [cartons, setCartons] = useState("")
  // const [actualCartons, setActualCartons] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [actualGrossWeight, setActualGrossWeight] = useState("")
  const [grossVolume, setGrossVolume] = useState("")
  const [actualGrossVolume, setActualGrossVolume] = useState("")
  const [remarks, setRemarks] = useState("")
  const [client, setClient] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [driverNic, setDriverNic] = useState("")
  const [driverContactNo, setDriverContactNo] = useState("")
  const [wharfStaffContactNo, setWharfStaffContactNo] = useState("")

  const [driverContactNoOptional, setDriverContactNoOptional] = useState("")
  const [wharfStaffContactNoOptional, setWharfStaffContactNoOptional] =
    useState("")
  const [quantityLoaded, setQuantityLoaded] = useState("")

  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const { data: packingLists } = useQuery({
    queryKey: ["packingLists", "completed"],
    queryFn: () => fetchPackingLists("completed"),
  })

  const { data: driversData } = useQuery({
    queryKey: ["drivers"],
    queryFn: fetchDrivers,
  })

  const { data: wharfStaffData } = useQuery({
    queryKey: ["wharfStaff"],
    queryFn: fetchWharfStaff,
  })

  const driverOptions = useMemo(() => driversData?.data ?? [], [driversData])

  const wharfStaffOptions = useMemo(
    () => wharfStaffData?.data ?? [],
    [wharfStaffData]
  )

  const manufacturerOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Supplier) || []
  }, [data])

  const clientOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Client) || []
  }, [data])

  const forwarderOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Forwarder) || []
  }, [data])

  const toggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const rows: PackingListRow[] = useMemo(() => {
    return (
      packingLists?.data?.map((pl: any) => ({
        id: pl.packing_list_id,
        packingListNo: `PL-${pl.packing_list_id}`,
        clientId: pl.client_id ?? null,
        clientName: pl.client_name ?? `Client #${pl.client_id ?? "—"}`,
        forwarderId: pl.forwarder_id ?? null,
        forwarderName: pl.forwarder_id
          ? (pl.forwarder_name ?? `Forwarder #${pl.forwarder_id}`)
          : "—",
        poNumber: pl.purchase_orders?.[0]?.po_number ?? "—",
        date: pl.date
          ? new Date(pl.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        quantity: pl.quantity,
        gdnNo: pl.gdn_id ? `GDN-${pl.gdn_id}` : "—",
        status: pl.purchase_orders?.[0]?.status ?? "—",
      })) ?? []
    )
  }, [packingLists])

  // Client & Forwarder are derived from the selected packing list(s) —
  // the GDN generator cannot amend these directly.
  const selectedPackingListRows = useMemo(
    () => rows.filter((r) => selectedRows.includes(r.id)),
    [rows, selectedRows]
  )

  const derivedClient = selectedPackingListRows[0] ?? null
  const derivedForwarder = selectedPackingListRows[0] ?? null

  const selectedDriver = useMemo(
    () => driverOptions.find((d: any) => String(d.id) === driver),
    [driverOptions, driver]
  )

  const selectedWharfStaff = useMemo(
    () => wharfStaffOptions.find((w: any) => String(w.id) === wharfStaff),
    [wharfStaffOptions, wharfStaff]
  )

  const packingListQuantity = useMemo(
    () =>
      selectedRows.reduce((accumulator, currentValue) => {
        return accumulator + currentValue
      }, 0),
    [selectedRows]
  )

  const handleSave = async () => {
    if (!derivedClient || !derivedForwarder) {
      alert(
        "Please select at least one packing list to derive Client and Forwarder."
      )
      return
    }
    if (!manufacturer || !date) {
      alert("Please fill in Date and Manufacturer.")
      return
    }
    if (!deliveredTo) {
      alert("Please select a Dispatch Location.")
      return
    }
    if (!transportMode) {
      alert("Please select a Cargo Transport Mode.")
      return
    }
    if (
      transportMode === "FCL container" &&
      (!containerNo || !containerSize || !primarySealNo || !secondarySealNo)
    ) {
      alert(
        "Please fill in Container No, Container Size, Primary Seal No, and Secondary Seal No."
      )
      return
    }
    if (!driver) {
      alert("Please select a Driver.")
      return
    }
    if (!wharfStaff) {
      alert("Please select Wharf Staff.")
      return
    }
    if (!status) {
      alert("Please select a Status.")
      return
    }
    if (!client || !forwarder) {
      alert("Please select a Client and Forwarder.")
      return
    }

    try {
      setIsSaving(true)

      const formattedDate = `${date} 00:00:00`

      await createGoodsDispatchNote({
        client_id: Number(client),
        forwarder_id: Number(forwarder),
        manufacture_id: Number(manufacturer),
        date: formattedDate,
        packing_list_ids: selectedRows,
        cartoons: quantityLoaded,
        // actual_cartoons: actualCartons,
        gross_weight: grossWeight,
        actual_gross_weight: actualGrossWeight,
        gross_volume: grossVolume,
        actual_gross_volume: actualGrossVolume,
        status,
        // TODO: replace with the actual logged-in user (e.g. from an auth/session context)
        created_by: "admin",
        gdn_grn_ref: gdnReference,
        vehicle_no: vehicleNo,
        driver_id: Number(driver),
        dispatch_location: deliveredTo,
        transport_mode: transportMode,
        ...(transportMode === "FCL container"
          ? {
              container_no: containerNo,
              container_size: containerSize,
              primary_seal_no: primarySealNo,
              secondary_seal_no: secondarySealNo,
            }
          : {}),
        custom_doc_status: customDocStatus,
        wharf_staff_id: Number(wharfStaff),
        driver_contact_no: driverContactNoOptional,
        wharf_contact_no: wharfStaffContactNoOptional,
      })
      router.push("/gdn")
    } catch (err) {
      console.error(err)
      alert("Failed to save goods dispatch note.")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    setDriverNic(selectedDriver?.nic_no ?? "")
    setDriverContactNo(selectedDriver?.contact_no ?? "")
  }, [selectedDriver])

  useEffect(() => {
    setWharfStaffContactNo(selectedWharfStaff?.contact_no ?? "")
  }, [selectedWharfStaff])

  return (
    <div className="mx-auto space-y-5">
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="rounded-md"
          onClick={() => router.push("/gdn")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={handleSave} disabled={isSaving}>
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
              Core shipment reference information.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gdn-reference"
                  className="text-xs font-medium text-foreground"
                >
                  GDN/GRN Reference
                </Label>
                <Input
                  id="gdn-reference"
                  placeholder="Enter GDN/GRN Reference"
                  value={gdnReference}
                  onChange={(e) => setGdnReference(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Manufacturer
                </Label>
                <Select value={manufacturer} onValueChange={setManufacturer}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Manufacturer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {manufacturerOptions.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Business Partners
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Client and Forwarder are derived automatically from the selected
              packing list(s) and cannot be changed here.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Customer (Client)
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
                  Forwarder
                </Label>
                <Select value={forwarder} onValueChange={setForwarder}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Forwarder" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {forwarderOptions.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Dispatch Location & Transport
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Where the shipment is dispatched from and how it's moving.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Delivered To
              </Label>
              <Select value={deliveredTo} onValueChange={setDeliveredTo}>
                <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                  <SelectValue placeholder="Choose Delivered To Location" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                  {DISPATCH_LOCATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Cargo Transport Mode
              </Label>
              <Select value={transportMode} onValueChange={setTransportMode}>
                <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                  <SelectValue placeholder="Choose Transport Mode" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                  {TRANSPORT_MODE_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {transportMode === "FCL container" && (
              <div className="space-y-4 rounded-md border border-neutral-800 bg-neutral-950/40 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="container-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Container Number
                    </Label>
                    <Input
                      id="container-no"
                      placeholder="Enter Container Number"
                      value={containerNo}
                      onChange={(e) => setContainerNo(e.target.value)}
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Container Size
                    </Label>
                    <Select
                      value={containerSize}
                      onValueChange={setContainerSize}
                    >
                      <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                        <SelectValue placeholder="Choose Size" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                        {CONTAINER_SIZE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="primary-seal-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Primary Seal Number
                    </Label>
                    <Input
                      id="primary-seal-no"
                      placeholder="Enter Primary Seal Number"
                      value={primarySealNo}
                      onChange={(e) => setPrimarySealNo(e.target.value)}
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="secondary-seal-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Secondary (Final) Seal Number
                    </Label>
                    <Input
                      id="secondary-seal-no"
                      placeholder="Enter Secondary Seal Number"
                      value={secondarySealNo}
                      onChange={(e) => setSecondarySealNo(e.target.value)}
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Vehicle & Personnel
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Driver and wharf staff details are extracted from their existing
              profiles.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="vehicle-no"
                className="text-xs font-medium text-foreground"
              >
                Vehicle No
              </Label>
              <Input
                id="vehicle-no"
                placeholder="Enter Vehicle No"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Driver
              </Label>
              <Select value={driver} onValueChange={setDriver}>
                <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                  <SelectValue placeholder="Choose Driver" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                  {driverOptions.map((d: any) => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Driver NIC
                </Label>
                <Input
                  disabled
                  id="driver-nic"
                  placeholder="Enter Driver NIC"
                  value={driverNic}
                  onChange={(e) => setDriverNic(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Driver Contact No
                </Label>
                <Input
                  disabled
                  id="driver-contact-no"
                  placeholder="Enter Driver Contact No"
                  value={driverContactNo}
                  onChange={(e) => setDriverContactNo(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Driver Contact No (Optional)
                </Label>
                <Input
                  id="driver-contact-no-optional"
                  placeholder="Enter Driver Contact No (Optional)"
                  value={driverContactNoOptional}
                  onChange={(e) => setDriverContactNoOptional(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Wharf Staff
              </Label>
              <Select value={wharfStaff} onValueChange={setWharfStaff}>
                <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                  <SelectValue placeholder="Choose Wharf Staff" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                  {wharfStaffOptions.map((w: any) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Wharf Staff Contact No
              </Label>
              <Input
                disabled
                id="wharf-staff-contact-no"
                placeholder="Enter Wharf Staff Contact No"
                value={wharfStaffContactNo}
                onChange={(e) => setWharfStaffContactNo(e.target.value)}
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Wharf Staff Contact No (Optional)
              </Label>
              <Input
                id="wharf-staff-contact-no-optional"
                placeholder="Enter Wharf Staff Contact No (Optional)"
                value={wharfStaffContactNoOptional}
                onChange={(e) => setWharfStaffContactNoOptional(e.target.value)}
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
              Packing Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Planned cartons and the actual physical count loaded.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cartons"
                  className="text-xs font-medium text-foreground"
                >
                  Packing List Quantity
                </Label>
                <Input
                  disabled
                  id="cartons"
                  placeholder="Enter Cartons"
                  value={packingListQuantity}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cartons"
                  className="text-xs font-medium text-foreground"
                >
                  Quantity Loaded
                </Label>
                <Input
                  id="quantity-loaded"
                  placeholder="Enter Quantity Loaded"
                  value={quantityLoaded}
                  onChange={(e) => setQuantityLoaded(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Customs Document Status
              </Label>
              <Select
                value={customDocStatus}
                onValueChange={setCustomDocStatus}
              >
                <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                  <SelectValue placeholder="Choose Status" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                  {CUSTOM_DOC_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Measurements
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Planned versus actual shipment measurements.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                  htmlFor="actual-gross-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Gross Weight
                </Label>
                <Input
                  id="actual-gross-weight"
                  placeholder="Enter Actual Gross Weight"
                  value={actualGrossWeight}
                  onChange={(e) => setActualGrossWeight(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gross-volume"
                  className="text-xs font-medium text-foreground"
                >
                  Gross Volume
                </Label>
                <Input
                  id="gross-volume"
                  placeholder="Enter Gross Volume"
                  value={grossVolume}
                  onChange={(e) => setGrossVolume(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="actual-gross-volume"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Gross Volume
                </Label>
                <Input
                  id="actual-gross-volume"
                  placeholder="Enter Actual Gross Volume"
                  value={actualGrossVolume}
                  onChange={(e) => setActualGrossVolume(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Available Packing Lists
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Select the packing list(s) for this dispatch. Customer and
              Forwarder above are extracted automatically from your selection.
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Packing List No
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Client
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Forwarder
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      PO Number
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Quantity
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      GDN No
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length ? (
                    rows.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-100">
                          {row.packingListNo}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.clientName}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.forwarderName}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.poNumber}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.gdnNo}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                            {row.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                            className="border-neutral-600"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="h-24 text-center text-sm text-zinc-500"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Additional Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Any other notes relevant to this dispatch.
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
      </div>
    </div>
  )
}