"use client"

interface PackingListRow {
  id: number
  packingListNo: string
  documentDate: string
  shipTo: string
  shippingMode: string
  totalCartons: number
  totalCbm: string
  totalNetWeightKg: string
  totalQuantity: number
  totalVolume: string
}

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
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
import {
  fetchGoodsDispatchNoteById,
  updateGoodsDispatchNote,
} from "@/lib/api/goods_dispatch_notes"
import { fetchPackingLists } from "@/lib/api/packing_lists"
import { fetchWharfStaff } from "@/lib/api/wharf_staff"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { IconCalendarFilled } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

const DISPATCH_LOCATION_OPTIONS = [
  { label: "Airport – Katunayaka (Air)", value: "Katunayaka Airport" },
  { label: "Sea Port – Colombo Port (FCL)", value: "Colombo Port" },
  {
    label: "Consolidator's Warehouse – ACE Yard (LCL)",
    value: "ACE Yard",
  },
]

const TRANSPORT_MODE_OPTIONS = ["FCL container", "Loose cargo"]

const CONTAINER_SIZE_OPTIONS = ["20GP", "40GP", "40HC"]

const CUSTOM_DOC_STATUS_OPTIONS = ["Pending", "In Progress", "Completed"]

const STATUS_OPTIONS = ["Draft", "Saved", "Completed"]

const parseDateValue = (val: string): Date | undefined => {
  if (!val) return undefined
  let d = parse(val, "yyyy-MM-dd HH:mm:ss", new Date())
  if (isValid(d)) return d
  d = parse(val, "yyyy-MM-dd", new Date())
  if (isValid(d)) return d
  d = new Date(val)
  if (isValid(d)) return d
  return undefined
}

const findOptionValueByName = (
  options: any[] | undefined,
  name?: string | null
): string => {
  if (!name) return ""
  const normalized = name.toString().trim().toLowerCase()
  const match = options?.find((item: any) => {
    const label = item?.name ?? item?.full_name ?? ""
    return label.toString().trim().toLowerCase() === normalized
  })
  return match ? String(match.id) : ""
}

export default function GDNEdit() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [isSaving, setIsSaving] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

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
  const [grossWeight, setGrossWeight] = useState("")
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
  const [cartoonLength, setCartoonLength] = useState("")
  const [cartoonWidth, setCartoonWidth] = useState("")
  const [cartoonHeight, setCartoonHeight] = useState("")

  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { data: gdnRes, isLoading: isGdnLoading } = useQuery({
    queryKey: ["gdn", id],
    queryFn: () => fetchGoodsDispatchNoteById(id),
    enabled: !!id,
  })

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

  const volumeM3 = useMemo(() => {
    const l = Number(cartoonLength)
    const w = Number(cartoonWidth)
    const h = Number(cartoonHeight)
    return (l * w * h) / 1_000_000
  }, [cartoonLength, cartoonWidth, cartoonHeight])

  const calculatedVolume = useMemo(() => {
    return volumeM3 * Number(quantityLoaded)
  }, [volumeM3, quantityLoaded])

  const toggleRow = (rowId: number) => {
    setSelectedRows((prev) =>
      prev.includes(rowId) ? prev.filter((r) => r !== rowId) : [...prev, rowId]
    )
  }

  // Rows available for selection, sourced from the "completed" packing
  // lists endpoint.
  const availableRows: PackingListRow[] = useMemo(() => {
    return (
      packingLists?.data?.map((pl: any) => ({
        id: pl.packing_list_id,
        packingListNo: pl.packing_list_no ?? "",
        documentDate: pl.document_date
          ? new Date(pl.document_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        shipTo: pl.ship_to ?? "",
        shippingMode: pl.shipping_mode ?? "",
        totalCartons: pl.total_cartons ?? 0,
        totalCbm: pl.total_cbm ?? "0",
        totalNetWeightKg: pl.total_net_weight_kg ?? "0",
        totalQuantity: pl.total_quantity ?? 0,
        totalVolume: pl.total_volume ?? "0",
      })) ?? []
    )
  }, [packingLists])

  // The GDN's currently-linked packing lists — kept visible in the table
  // even if they no longer show up in the "completed" list, so the user
  // never loses sight of what's already attached to this GDN.
  const linkedRows: PackingListRow[] = useMemo(() => {
    return (
      gdnRes?.data?.packing_lists?.map((pl: any) => ({
        id: pl.id,
        packingListNo: pl.packing_list_no ?? `PL-${pl.id}`,
        documentDate: pl.date
          ? new Date(pl.date.replace(" ", "T")).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        shipTo: pl.ship_to ?? "",
        shippingMode: pl.shipping_mode ?? "",
        totalCartons: pl.total_cartons ?? 0,
        totalCbm: pl.total_cbm ?? "0",
        totalNetWeightKg: pl.total_net_weight_kg ?? "0",
        totalQuantity: pl.total_quantity ?? 0,
        totalVolume: pl.total_volume ?? "0",
      })) ?? []
    )
  }, [gdnRes])

  const rows: PackingListRow[] = useMemo(() => {
    const merged = [...linkedRows]
    availableRows.forEach((row) => {
      if (!merged.some((r) => r.id === row.id)) {
        merged.push(row)
      }
    })
    return merged
  }, [linkedRows, availableRows])

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
      selectedRows.reduce((accumulator, rowId) => {
        const row = rows.find((r) => r.id === rowId)
        return accumulator + (row?.totalCartons ?? 0)
      }, 0),
    [selectedRows, rows]
  )

  const quantityExceedsAvailable = useMemo(() => {
    const loaded = Number(quantityLoaded)
    return quantityLoaded !== "" && loaded > packingListQuantity
  }, [quantityLoaded, packingListQuantity])

  // Hydrate all form state from the fetched GDN, once, when it arrives.
  useEffect(() => {
    if (hasHydrated || !gdnRes?.data) return
    const gdn = gdnRes.data

    const readyToHydrate =
      (!gdn.client_name || clientOptions.length > 0) &&
      (!gdn.forwarder_name || forwarderOptions.length > 0) &&
      (!gdn.manufacture_name || manufacturerOptions.length > 0) &&
      (!gdn.driver_name || driverOptions.length > 0) &&
      (!gdn.wharf_staff_name || wharfStaffOptions.length > 0)

    if (!readyToHydrate) return

    setDate(
      gdn.date
        ? format(parseDateValue(gdn.date) ?? new Date(gdn.date), "yyyy-MM-dd")
        : ""
    )

    setGdnReference(gdn.gdn_grn_ref ?? "")
    setVehicleNo(gdn.vehicle_no ?? "")
    setManufacturer(
      gdn.manufacture_id
        ? String(gdn.manufacture_id)
        : findOptionValueByName(manufacturerOptions, gdn.manufacture_name)
    )
    setDriver(
      gdn.driver_id
        ? String(gdn.driver_id)
        : findOptionValueByName(driverOptions, gdn.driver_name)
    )
    setWharfStaff(
      gdn.wharf_staff_id
        ? String(gdn.wharf_staff_id)
        : findOptionValueByName(wharfStaffOptions, gdn.wharf_staff_name)
    )
    setDeliveredTo(gdn.dispatch_location ?? "")
    setTransportMode(gdn.transport_mode ?? "")
    setContainerNo(gdn.container_no ?? "")
    setContainerSize(gdn.container_size ?? "")
    setPrimarySealNo(gdn.primary_seal_no ?? "")
    setSecondarySealNo(gdn.secondary_seal_no ?? "")
    setCustomDocStatus(gdn.custom_doc_status ?? "")
    setStatus(gdn.status ?? "")
    setGrossWeight(gdn.gross_weight ? String(gdn.gross_weight) : "")
    setRemarks(gdn.remarks ?? "")
    setClient(
      gdn.client_id
        ? String(gdn.client_id)
        : findOptionValueByName(clientOptions, gdn.client_name)
    )
    setForwarder(
      gdn.forwarder_id
        ? String(gdn.forwarder_id)
        : findOptionValueByName(forwarderOptions, gdn.forwarder_name)
    )
    setDriverContactNoOptional(gdn.driver_contact_no_optional ?? "")
    setWharfStaffContactNoOptional(gdn.wharf_contact_no_optional ?? "")
    setQuantityLoaded(gdn.cartoons ? String(gdn.cartoons) : "")
    setCartoonLength(gdn.length_cm ? String(gdn.length_cm) : "")
    setCartoonWidth(gdn.width_cm ? String(gdn.width_cm) : "")
    setCartoonHeight(gdn.height_cm ? String(gdn.height_cm) : "")
    setDriverNic(gdn.driver_nic_no ?? "")
    setDriverContactNo(gdn.driver_contact_no ?? "")
    setWharfStaffContactNo(gdn.wharf_contact_no ?? "")
    setSelectedRows(gdn.packing_lists?.map((pl: any) => pl.id) ?? [])

    setHasHydrated(true)
  }, [
    gdnRes,
    hasHydrated,
    clientOptions,
    forwarderOptions,
    manufacturerOptions,
    driverOptions,
    wharfStaffOptions,
  ])

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
    if (!quantityLoaded || Number(quantityLoaded) <= 0) {
      alert("Please enter a valid Quantity Loaded.")
      return
    }
    if (Number(quantityLoaded) > packingListQuantity) {
      alert(
        `Quantity Loaded (${quantityLoaded}) cannot exceed the Packing List Quantity (${packingListQuantity}).`
      )
      return
    }

    try {
      setIsSaving(true)

      const formattedDate = `${date} 00:00:00`

      await updateGoodsDispatchNote(id, {
        client_id: Number(client),
        forwarder_id: Number(forwarder),
        manufacture_id: Number(manufacturer),
        date: formattedDate,
        packing_list_ids: selectedRows,
        cartoons: quantityLoaded,
        gross_weight: grossWeight,
        gross_volume: calculatedVolume,
        status,
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
        driver_contact_no: driverContactNo,
        driver_contact_no_optional: driverContactNoOptional,
        wharf_contact_no: wharfStaffContactNo,
        wharf_contact_no_optional: wharfStaffContactNoOptional,
        length_cm: Number(cartoonLength),
        width_cm: Number(cartoonWidth),
        height_cm: Number(cartoonHeight),
        remarks,
      })
      router.push("/gdn")
    } catch (err) {
      console.error(err)
      alert("Failed to update goods dispatch note.")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!selectedDriver) return
    setDriverNic(selectedDriver?.nic_no ?? "")
    setDriverContactNo(selectedDriver?.contact_no ?? "")
  }, [selectedDriver])

  useEffect(() => {
    if (!selectedWharfStaff) return
    setWharfStaffContactNo(selectedWharfStaff?.contact_no ?? "")
  }, [selectedWharfStaff])

  if (isGdnLoading) return <div>Loading…</div>

  return (
    <div className="mx-6 mb-5 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`${gdnRes?.data?.gdn_no ?? ""}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Good Dispatch Note", href: "/gdn" },
          ]}
        />
      </div>

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
                            const selectedDate = parseDateValue(date)
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
                      selected={parseDateValue(date)}
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
                  htmlFor="quantity-loaded"
                  className="text-xs font-medium text-foreground"
                >
                  Quantity Loaded
                </Label>
                <Input
                  id="quantity-loaded"
                  type="number"
                  max={packingListQuantity}
                  placeholder="Enter Quantity Loaded"
                  value={quantityLoaded}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val !== "" && Number(val) > packingListQuantity) {
                      setQuantityLoaded(String(packingListQuantity))
                    } else {
                      setQuantityLoaded(val)
                    }
                  }}
                  className={cn(
                    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                    quantityExceedsAvailable &&
                      "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {quantityExceedsAvailable && (
                  <p className="text-xs text-red-500">
                    Cannot exceed Packing List Quantity ({packingListQuantity})
                  </p>
                )}
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
                  htmlFor="cartoon-length"
                  className="text-xs font-medium text-foreground"
                >
                  Cartoon Dimensions - L (cm)
                </Label>
                <Input
                  id="cartoon-length"
                  placeholder="Enter Length"
                  value={cartoonLength}
                  onChange={(e) => setCartoonLength(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cartoon-width"
                  className="text-xs font-medium text-foreground"
                >
                  Cartoon Dimensions - W (cm)
                </Label>
                <Input
                  id="cartoon-width"
                  placeholder="Enter Width"
                  value={cartoonWidth}
                  onChange={(e) => setCartoonWidth(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cartoon-height"
                  className="text-xs font-medium text-foreground"
                >
                  Cartoon Dimensions - H (cm)
                </Label>
                <Input
                  id="cartoon-height"
                  placeholder="Enter Height"
                  value={cartoonHeight}
                  onChange={(e) => setCartoonHeight(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Per Cartoon Volume (m³)
                </Label>
                <Input
                  disabled
                  value={volumeM3}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Calculated Volume (m³)
                </Label>
                <Input
                  disabled
                  value={calculatedVolume}
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
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Ship To
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Shipping Mode
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Cartons
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total CBM
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Net Weight(kg)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Quantity
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Volume
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
                          {row.documentDate}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.shipTo}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.shippingMode}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalCartons}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalCbm}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalNetWeightKg}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalQuantity}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalVolume}
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
                        colSpan={10}
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
