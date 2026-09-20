"use client"

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { fetchClients } from "@/lib/api/clients"
import { fetchGDNs } from "@/lib/api/goods_dispatch_notes"
import {
  fetchGoodsReceiveNoteById,
  updateGoodsReceiveNote,
} from "@/lib/api/goods_receive_notes"
import { fetchRecipients } from "@/lib/api/recipients"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { IconCalendarFilled, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

interface PackingListRow {
  id: number
  gdnNo: string
  documentDate: string
  cartons: string | number
  vehicleNo: string
  transportMode: string
  containerNo: string
  grossWeight: string
  grossVolume: string
}

interface ActualMeasurementRow {
  id: number
  length: string
  width: string
  height: string
  total: string
  uom: string
  cbm: string
  volume: string
}

interface GdnMeasurementRow {
  id: number
  packages: number
  length_cm: string
  width_cm: string
  height_cm: string
  cbm: string
  volume: string
  uom: string
  total: string
}

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

export default function GRNEdit() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [isSaving, setIsSaving] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)

  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [recipient, setRecipient] = useState("")
  const [recipientContact, setRecipientContact] = useState("")
  const [status, setStatus] = useState("draft")
  const [remarks, setRemarks] = useState("")

  const [selectedRows, setSelectedRows] = useState<number[]>([])

  // --- Actual Measurements state (added) ---
  const ACTUAL_UOM_OPTIONS = ["cm", "m"]

  const EMPTY_ACTUAL_DRAFT = {
    length: "",
    width: "",
    height: "",
    total: "",
    uom: "cm",
  }

  const [actualMeasurements, setActualMeasurements] = useState<
    ActualMeasurementRow[]
  >([])
  const [actualDraft, setActualDraft] =
    useState<typeof EMPTY_ACTUAL_DRAFT>(EMPTY_ACTUAL_DRAFT)
  const actualDraftLengthRef = useRef<HTMLInputElement | null>(null)

  const { data: grnRes, isLoading: isGrnLoading } = useQuery({
    queryKey: ["grn", id],
    queryFn: () => fetchGoodsReceiveNoteById(id),
    enabled: !!id,
  })

  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const { data: gdns } = useQuery({
    queryKey: ["gdns", "completed"],
    queryFn: () => fetchGDNs("completed"),
  })

  const { data: recipientsList } = useQuery({
    queryKey: ["recipientsList"],
    queryFn: fetchRecipients,
  })

  const clientOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Client) || []
  }, [data])

  const forwarderOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Forwarder) || []
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Supplier) || []
  }, [data])

  const recipientOptions = useMemo(
    () => recipientsList?.data ?? [],
    [recipientsList]
  )

  // --- Linked GDN + its measurements (added) ---
  const linkedGdn = useMemo(() => {
    return grnRes?.data?.gdns?.[0] ?? null
  }, [grnRes])

  const gdnMeasurements: GdnMeasurementRow[] = useMemo(() => {
    return linkedGdn?.measurements ?? []
  }, [linkedGdn])

  const toggleRow = (rowId: number) => {
    setSelectedRows((prev) => {
      // Always allow unchecking
      if (prev.includes(rowId)) {
        return prev.filter((r) => r !== rowId)
      }

      const row = rows.find((r) => r.id === rowId)
      if (!row) return prev

      // If something is already selected, block a different shipping mode
      if (lockedShippingMode && row.transportMode !== lockedShippingMode) {
        alert(
          `You can only select GDNs with the same Transport Mode (${lockedShippingMode}).`
        )
        return prev
      }

      return [...prev, rowId]
    })
  }

  // Rows available for selection, sourced from the completed GDNs endpoint.
  const availableRows: PackingListRow[] = useMemo(() => {
    return (
      gdns?.data?.map((gdn: any) => ({
        id: gdn.id,
        gdnNo: gdn.gdn_no ?? `GDN-${gdn.id}`,
        documentDate: gdn.date
          ? format(new Date(gdn.date), "dd/MMM/yy")
          : "N/A",
        cartons: gdn.cartoons ?? "N/A",
        vehicleNo: gdn.vehicle_no ?? "N/A",
        transportMode: gdn.transport_mode ?? "N/A",
        containerNo: gdn.container_no ?? "N/A",
        grossWeight: gdn.gross_weight ?? gdn.actual_gross_weight ?? "N/A",
        grossVolume: gdn.gross_volume ?? "N/A",
      })) ?? []
    )
  }, [gdns])

  const linkedRows: PackingListRow[] = useMemo(() => {
    return (
      (grnRes?.data?.gdns ?? grnRes?.data?.packing_lists)?.map((gdn: any) => ({
        id: gdn.id,
        gdnNo: gdn.gdn_no ?? `GDN-${gdn.id}`,
        documentDate: gdn.date
          ? format(new Date(gdn.date), "dd/MMM/yy")
          : "N/A",
        cartons: gdn.cartoons ?? "N/A",
        vehicleNo: gdn.vehicle_no ?? "N/A",
        transportMode: gdn.transport_mode ?? "N/A",
        containerNo: gdn.container_no ?? "N/A",
        grossWeight: gdn.gross_weight ?? gdn.actual_gross_weight ?? "N/A",
        grossVolume: gdn.gross_volume ?? "N/A",
      })) ?? []
    )
  }, [grnRes])

  const rows: PackingListRow[] = useMemo(() => {
    const merged = [...linkedRows]
    availableRows.forEach((row) => {
      if (!merged.some((r) => r.id === row.id)) {
        merged.push(row)
      }
    })
    return merged
  }, [linkedRows, availableRows])

  const selectedPackingListRows = useMemo(
    () => rows.filter((r) => selectedRows.includes(r.id)),
    [rows, selectedRows]
  )

  const lockedShippingMode = useMemo(() => {
    return selectedPackingListRows[0]?.transportMode ?? null
  }, [selectedPackingListRows])

  const totalCartonCount = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + Number(row.cartons ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

  const totalVolume = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + Number(row.grossVolume ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

  const totalGrossWeight = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + Number(row.grossWeight ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

  const quantity = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + Number(row.cartons ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

  // --- Actual Measurements helpers (added, same math as Create form) ---
  const getActualRowVolumeM3 = (row: {
    length: string
    width: string
    height: string
    total: string
    uom: string
  }) => {
    const l = Number(row.length)
    const w = Number(row.width)
    const h = Number(row.height)
    const packages = Number(row.total)

    if (row.uom === "m") {
      return (l * w * h * packages) / 6000
    }
    return ((l * w * h) / 1_000_000) * packages
  }

  const getActualRowCbm = getActualRowVolumeM3

  const getActualRowTotalVolume = (row: {
    length: string
    width: string
    height: string
    total: string
    uom: string
  }) => {
    return getActualRowCbm(row) * Number(row.total)
  }

  const totalActualVolume = useMemo(() => {
    return actualMeasurements.reduce(
      (sum: number, row: any) => sum + getActualRowTotalVolume(row),
      0
    )
  }, [actualMeasurements])

  const updateActualDraftField = (
    field: "length" | "width" | "height" | "total" | "uom",
    value: string
  ) => {
    setActualDraft((prev) => ({ ...prev, [field]: value }))
  }

  const isActualDraftValid = useMemo(() => {
    return (
      actualDraft.length !== "" &&
      actualDraft.width !== "" &&
      actualDraft.height !== "" &&
      actualDraft.total !== "" &&
      Number(actualDraft.length) > 0 &&
      Number(actualDraft.width) > 0 &&
      Number(actualDraft.height) > 0 &&
      Number(actualDraft.total) > 0
    )
  }, [actualDraft])

  const handleAddActualMeasurement = () => {
    if (!isActualDraftValid) return

    const cbm = getActualRowCbm(actualDraft)
    const volume = getActualRowTotalVolume(actualDraft)

    const newRow: ActualMeasurementRow = {
      id: Date.now(),
      ...actualDraft,
      cbm: cbm.toFixed(4),
      volume: volume.toFixed(4),
    }

    setActualMeasurements((prev: any[]) => [...prev, newRow])
    setActualDraft(EMPTY_ACTUAL_DRAFT)

    requestAnimationFrame(() => {
      actualDraftLengthRef.current?.focus()
    })
  }

  const handleActualDraftKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    handleAddActualMeasurement()
  }

  const removeActualMeasurement = (rowId: number) => {
    setActualMeasurements((prev: any[]) => prev.filter((m) => m.id !== rowId))
  }

  // Hydrate all form state from the fetched GRN, once, when it arrives.
  useEffect(() => {
    if (hasHydrated || !grnRes?.data) return
    const grn = grnRes.data

    // client_id / manufacture_id / forwarder_id come back as NAME strings
    // from this endpoint (mislabeled by the backend), not numeric IDs —
    // so they always need to be resolved by name, never used directly.
    const readyToHydrate =
      (!grn.client_id || clientOptions.length > 0) &&
      (!grn.forwarder_id || forwarderOptions.length > 0) &&
      (!grn.manufacture_id || manufacturerOptions.length > 0) &&
      (!grn.recipient_name || recipientOptions.length > 0)

    if (!readyToHydrate) return

    setDate(
      grn.date
        ? format(parseDateValue(grn.date) ?? new Date(grn.date), "yyyy-MM-dd")
        : ""
    )
    setClient(findOptionValueByName(clientOptions, grn.client_id))
    setForwarder(findOptionValueByName(forwarderOptions, grn.forwarder_id))
    setManufacturer(
      findOptionValueByName(manufacturerOptions, grn.manufacture_id)
    )
    setRecipient(findOptionValueByName(recipientOptions, grn.recipient_name))
    setRecipientContact(grn.recipient_contact ?? "")
    setStatus(grn.status ?? "draft")
    setRemarks(grn.comments ?? "")
    setSelectedRows(
      (grn.gdns ?? grn.packing_lists)?.map((item: any) => item.id) ?? []
    )

    // Hydrate actual measurements from grn.measurements (added)
    setActualMeasurements(
      grn.measurements?.map((m: any) => ({
        id: m.id ?? Date.now() + Math.random(),
        length: String(m.length_cm ?? ""),
        width: String(m.width_cm ?? ""),
        height: String(m.height_cm ?? ""),
        total: String(m.total ?? m.packages ?? ""),
        uom: (m.uom ?? "cm").toLowerCase(),
        cbm: String(m.cbm ?? "0"),
        volume: String(m.volume ?? "0"),
      })) ?? []
    )

    setHasHydrated(true)
  }, [
    grnRes,
    hasHydrated,
    clientOptions,
    forwarderOptions,
    manufacturerOptions,
    recipientOptions,
  ])

  const handleSave = async () => {
    if (!client || !forwarder || !manufacturer) {
      alert("Please select Client, Forwarder, and Manufacturer.")
      return
    }
    if (!date) {
      alert("Please select a Date.")
      return
    }
    if (!recipient) {
      alert("Please select a Recipient.")
      return
    }
    if (!status) {
      alert("Please select a Status.")
      return
    }
    if (selectedRows.length === 0) {
      alert("Please select at least one Packing List.")
      return
    }
    if (!actualMeasurements.length) {
      alert("Please add at least one actual measurement.")
      return
    }

    try {
      setIsSaving(true)
      await updateGoodsReceiveNote(id, {
        client,
        manufacturer,
        forwarder,
        recipient,
        recipientContact,
        status,
        date,
        quantity,
        selectedRows,
        remarks,
        measurements: actualMeasurements.map((m) => ({
          length_cm: Number(m.length),
          width_cm: Number(m.width),
          height_cm: Number(m.height),
          packages: Number(m.total),
          total: Number(m.total),
          uom: m.uom.toUpperCase(),
          cbm: Number(m.cbm),
          volume: Number(m.volume),
        })),
      })
      router.push("/grn")
    } catch (err) {
      console.error(err)
      alert("Failed to update goods receive note.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isGrnLoading) return <div>Loading…</div>

  return (
    <div className="mx-6 mb-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`GRN-${grnRes?.data?.id ?? ""}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Goods Receive Notes", href: "/grn" },
          ]}
        />
      </div>

      <div className="mx-auto space-y-5">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => router.push("/grn")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Shipment Information
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Enter shipment details, associated parties, and packing lists.
              </p>
            </div>

            <div className="space-y-4">
              {/* Row 1: Date, Client, Forwarder, Manufacturer */}
              <div className="grid grid-cols-4 gap-4">
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
                                ? format(selectedDate, "dd/MMM/yy")
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
                            setDate(format(selectedDate, "dd/MMM/yy"))
                          }
                        }}
                        captionLayout="dropdown"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
                    Forwarder
                  </Label>
                  <Select value={forwarder} onValueChange={setForwarder}>
                    <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                      <SelectValue placeholder="Choose Forwarder" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                      {forwarderOptions.map((f: any) => (
                        <SelectItem key={f.id} value={String(f.id)}>
                          {f.name}
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
                      <SelectValue placeholder="Select Manufacturer" />
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
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Recipient
                  </Label>
                  <Select value={recipient} onValueChange={setRecipient}>
                    <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                      <SelectValue placeholder="Select Recipient" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                      {recipientOptions.map((m: any) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Phone Number
                  </Label>
                  <Input
                    disabled
                    value={
                      recipientOptions.find(
                        (m: any) => String(m.id) === recipient
                      )?.contact_no ?? ""
                    }
                    placeholder="No phone number"
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="recipient-contact"
                    className="text-xs font-medium text-foreground"
                  >
                    Additional Phone Number
                  </Label>
                  <Input
                    id="recipient-contact"
                    placeholder="Enter Additional Phone Number"
                    value={recipientContact}
                    onChange={(e) => setRecipientContact(e.target.value)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="saved">Saved</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="HBL_OPEN" disabled>
                        HBL_OPEN
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Quantity, Total Carton Count, Total Volume, Total Gross Weight */}
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="quantity"
                    className="text-xs font-medium text-foreground"
                  >
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    placeholder="Enter Quantity"
                    value={quantity}
                    disabled
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                    placeholder="Enter Total Carton Count"
                    value={totalCartonCount}
                    disabled
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                    placeholder="Enter Total Volume"
                    value={totalVolume}
                    disabled
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="total-gross-weight"
                    className="text-xs font-medium text-foreground"
                  >
                    Total Gross Weight (Kg)
                  </Label>
                  <Input
                    id="total-gross-weight"
                    placeholder="Enter Total Gross Weight"
                    value={totalGrossWeight}
                    disabled
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Available Packing Lists
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Select from the available packing lists to associate with this
              </p>
            </div>

            <div className="space-y-4">
              <div className="overflow-x-auto rounded-md border border-neutral-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-700 hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-zinc-400">
                        GDN No
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Vehicle No
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Transport Mode
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Container No
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Gross Weight
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Gross Volume
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Cartons
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400"></TableHead>
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
                            {row.gdnNo}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.documentDate}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.vehicleNo}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.transportMode}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.containerNo}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.grossWeight}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.grossVolume}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.cartons}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300"></TableCell>
                          <TableCell>
                            {(() => {
                              const isDisabled =
                                !!lockedShippingMode &&
                                row.transportMode !== lockedShippingMode &&
                                !selectedRows.includes(row.id)

                              const checkboxEl = (
                                <Checkbox
                                  checked={selectedRows.includes(row.id)}
                                  disabled={isDisabled}
                                  onCheckedChange={() => toggleRow(row.id)}
                                  className="border-neutral-600"
                                />
                              )

                              if (!isDisabled) return checkboxEl

                              return (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex cursor-not-allowed">
                                        {checkboxEl}
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent className="border-neutral-700 bg-[#0A0A0A] text-xs text-zinc-100">
                                      Transport Mode locked to{" "}
                                      {lockedShippingMode}. Deselect all rows to
                                      switch modes.
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )
                            })()}
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

          {/* GDN Measurements (added) */}
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                GDN Measurements
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Total quantities, volumes, and weights derived from the
                associated GDN
              </p>
            </div>

            {gdnMeasurements.length ? (
              <div className="overflow-x-auto rounded-md border border-neutral-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-700 hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Length (cm)
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Width (cm)
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Height (cm)
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Packages
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        CBM
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Volume
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        UOM
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gdnMeasurements.map((m) => (
                      <TableRow
                        key={m.id}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-300">
                          {m.length_cm ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.width_cm ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.height_cm ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-100">
                          {m.packages ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.cbm ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.volume ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.uom ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.total ?? "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">
                No measurements available for this GDN.
              </p>
            )}
          </div>

          {/* Actual Measurements (added) */}
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Actual Measurements
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Enter the actual carton dimensions received, then click Add (or
                hit Enter) to add it to the list below.
              </p>
            </div>

            <div className="space-y-4">
              {/* Entry row */}
              <div className="flex items-end gap-2 rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label
                    htmlFor="actual-draft-length"
                    className="text-xs font-medium text-foreground"
                  >
                    Length ({actualDraft.uom})
                  </Label>
                  <Input
                    ref={actualDraftLengthRef}
                    id="actual-draft-length"
                    placeholder="Length"
                    value={actualDraft.length}
                    onChange={(e) =>
                      updateActualDraftField("length", e.target.value)
                    }
                    onKeyDown={handleActualDraftKeyDown}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label
                    htmlFor="actual-draft-width"
                    className="text-xs font-medium text-foreground"
                  >
                    Width ({actualDraft.uom})
                  </Label>
                  <Input
                    id="actual-draft-width"
                    placeholder="Width"
                    value={actualDraft.width}
                    onChange={(e) =>
                      updateActualDraftField("width", e.target.value)
                    }
                    onKeyDown={handleActualDraftKeyDown}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label
                    htmlFor="actual-draft-height"
                    className="text-xs font-medium text-foreground"
                  >
                    Height ({actualDraft.uom})
                  </Label>
                  <Input
                    id="actual-draft-height"
                    placeholder="Height"
                    value={actualDraft.height}
                    onChange={(e) =>
                      updateActualDraftField("height", e.target.value)
                    }
                    onKeyDown={handleActualDraftKeyDown}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label
                    htmlFor="actual-draft-total"
                    className="text-xs font-medium text-foreground"
                  >
                    Packages
                  </Label>
                  <Input
                    id="actual-draft-total"
                    placeholder="Total Packages"
                    value={actualDraft.total}
                    onChange={(e) =>
                      updateActualDraftField("total", e.target.value)
                    }
                    onKeyDown={handleActualDraftKeyDown}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    UOM
                  </Label>
                  <Select
                    value={actualDraft.uom}
                    onValueChange={(val) => updateActualDraftField("uom", val)}
                  >
                    <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                      <SelectValue placeholder="UOM" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                      {ACTUAL_UOM_OPTIONS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    CBM (m³)
                  </Label>
                  <Input
                    disabled
                    value={
                      isActualDraftValid
                        ? getActualRowCbm(actualDraft).toFixed(4)
                        : "0.0000"
                    }
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Volume (m³)
                  </Label>
                  <Input
                    disabled
                    value={
                      isActualDraftValid
                        ? getActualRowTotalVolume(actualDraft).toFixed(4)
                        : "0.0000"
                    }
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100"
                  />
                </div>

                <Button
                  onClick={handleAddActualMeasurement}
                  disabled={!isActualDraftValid}
                  className="mb-0.5 h-9 rounded-md"
                >
                  Add
                </Button>
              </div>

              {/* Committed rows table */}
              <div className="overflow-x-auto rounded-md border border-neutral-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-neutral-700 hover:bg-transparent">
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Length
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Width
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Height
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Packages
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        UOM
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        CBM (m³)
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Volume (m³)
                      </TableHead>
                      <TableHead className="text-xs font-medium text-zinc-400">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actualMeasurements.length ? (
                      actualMeasurements.map((row: any) => (
                        <TableRow
                          key={row.id}
                          className="border-neutral-800 hover:bg-neutral-800/40"
                        >
                          <TableCell className="text-sm text-zinc-300">
                            {row.length}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.width}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.height}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.total}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.uom}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.cbm}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-300">
                            {row.volume}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => removeActualMeasurement(row.id)}
                              className="flex items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 p-2 text-zinc-400 transition-colors hover:bg-neutral-700 hover:text-zinc-100"
                            >
                              <IconTrash size={15} />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="h-20 text-center text-sm text-zinc-500"
                        >
                          No actual measurements added yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end border-t border-neutral-800 pt-3">
                <div className="text-xs text-zinc-400">
                  Total Actual Volume:{" "}
                  <span className="font-medium text-zinc-100">
                    {totalActualVolume.toFixed(4)} m³
                  </span>
                </div>
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
        </div>
      </div>
    </div>
  )
}
