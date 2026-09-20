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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { fetchClients } from "@/lib/api/clients"
import { fetchGDNs } from "@/lib/api/goods_dispatch_notes"
import { createGoodsReceiveNote } from "@/lib/api/goods_receive_notes"
import { fetchRecipients } from "@/lib/api/recipients"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { GOODS_DELIVER_NOTE } from "@/modules/gdn/types"
import { IconCalendarFilled, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useRouter } from "next/navigation"
import { useMemo, useRef, useState } from "react"

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

export default function GoodsReceiveNoteForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [recipient, setRecipient] = useState("")
  // const [recipientContact, setRecipientContact] = useState("")
  const [status, setStatus] = useState("draft")
  // const [quantity, setQuantity] = useState("")
  // const [packingList, setPackingList] = useState("")
  const [remarks, setRemarks] = useState("")

  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [actual_cartons, setActualCartons] = useState<number>(0)

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
  const [actualDraft, setActualDraft] = useState(EMPTY_ACTUAL_DRAFT)
  const actualDraftLengthRef = useRef<HTMLInputElement | null>(null)

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
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
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Client) || []
    )
  }, [data])

  const forwarderOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === UserRole.Forwarder) ||
      []
    )
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === UserRole.Supplier) || []
  }, [data])

  const rows: GOODS_DELIVER_NOTE[] = useMemo(() => {
    return (
      gdns?.data?.map((gdn: any) => {
        const primaryPackingList = gdn.packing_lists?.[0] ?? null

        // If a GDN can have multiple packing lists, sum quantities across all of them
        const totalQuantity =
          gdn.packing_lists?.reduce(
            (sum: number, pl: any) => sum + (pl.total_quantity ?? 0),
            0
          ) ?? null

        // Derive total CBM/volume from measurements if not provided directly
        const totalCbm =
          gdn.measurements?.reduce(
            (sum: number, m: any) => sum + (m.cbm ?? 0),
            0
          ) ?? null

        const totalVolume =
          gdn.measurements?.reduce(
            (sum: number, m: any) => sum + (m.volume ?? 0),
            0
          ) ?? null

        return {
          id: gdn.id,
          gdn_no: gdn.gdn_no ?? "N/A",
          client_name: gdn.client_name ?? "N/A",
          manufacture_name: gdn.manufacture_name ?? "N/A",
          forwarder_name: gdn.forwarder_name ?? "N/A",
          date: gdn.date ? format(new Date(gdn.date), "dd/MMM/yy") : "N/A",
          cartoons: gdn.cartoons ?? "N/A",
          actual_cartoons: gdn.actual_cartoons ?? "N/A",
          gross_weight: gdn.gross_weight ?? "N/A",
          actual_gross_weight: gdn.actual_gross_weight ?? "N/A",
          gross_volume: gdn.gross_volume ?? "N/A",
          actual_gross_volume: gdn.actual_gross_volume ?? "N/A",
          vehicle_no: gdn.vehicle_no ?? "N/A",
          driver_name: gdn.driver_name ?? null,
          wharf_staff_name: gdn.wharf_staff_name ?? null,
          dispatch_location: gdn.dispatch_location ?? null,
          transport_mode: gdn.transport_mode ?? null,
          container_no: gdn.container_no ?? null,
          container_size: gdn.container_size ?? null,
          primary_seal_no: gdn.primary_seal_no ?? null,
          secondary_seal_no: gdn.secondary_seal_no ?? null,
          custom_doc_status: gdn.custom_doc_status ?? null,
          status: gdn.status ?? null,
          shipping_mode: primaryPackingList?.shipping_mode ?? "N/A",
          ship_to: primaryPackingList?.ship_to ?? "N/A",
          packing_list_no: primaryPackingList?.packing_list_no ?? "N/A",
          total_quantity: totalQuantity ?? "N/A",
          total_cbm: totalCbm ?? "N/A",
          total_volume: totalVolume ?? "N/A",
          measurements: gdn.measurements ?? [],
        }
      }) ?? []
    )
  }, [gdns])

  const selectedPackingListRows = useMemo(
    () => rows.filter((r) => selectedRows.includes(r.id)),
    [rows, selectedRows]
  )

  const lockedShipTo = useMemo(() => {
    return selectedPackingListRows[0]?.ship_to ?? null
  }, [selectedPackingListRows])

  // const quantity = useMemo(
  //   () =>
  //     selectedRows.reduce((accumulator, id) => {
  //       const gdn = gdns?.data?.find((pl: any) => pl.packing_list_id === id)
  //       return accumulator + Number(gdn?.total_quantity ?? 0)
  //     }, 0),
  //   [selectedRows, gdns]
  // )

  const toggleRow = (id: number) => {
    setSelectedRows((prev) => {
      if (prev.includes(id)) {
        return prev.filter((r) => r !== id)
      }

      const row = rows.find((r) => r.id === id)
      if (!row) return prev

      if (lockedShipTo && row.ship_to !== lockedShipTo) {
        alert(
          `You can only select GDNs with the same Ship To (${lockedShipTo}).`
        )
        return prev
      }

      return [...prev, id]
    })
  }

  const getActualRowCbm = (row: {
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

    const factor = row.uom === "m" ? 100 : 1
    return (l * factor * (w * factor) * (h * factor) * packages) / 1_000_000
  }

  const getActualRowTotalVolume = (row: {
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
    const factor = row.uom === "m" ? 100 : 1

    return (l * factor * (w * factor) * (h * factor) * packages) / 6000
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

  const removeActualMeasurement = (id: number) => {
    setActualMeasurements((prev: any[]) => prev.filter((m) => m.id !== id))
  }

  const handleSave = async () => {
    const selectedGdn = rows.find((row) => row.id === selectedRows[0])

    if (!client) {
      alert("Please select a Client.")
      return
    }
    if (!manufacturer) {
      alert("Please select a Manufacturer.")
      return
    }
    if (!forwarder) {
      alert("Please select a Forwarder.")
      return
    }
    if (!recipient) {
      alert("Please select a Recipient.")
      return
    }
    if (!date) {
      alert("Please select a Date.")
      return
    }
    if (!selectedGdn) {
      alert("Please select a GDN.")
      return
    }
    if (!actualMeasurements.length) {
      alert("Please add at least one actual measurement.")
      return
    }

    try {
      setIsSaving(true)

      await createGoodsReceiveNote({
        client_id: Number(client),
        manufacture_id: Number(manufacturer),
        forwarder_id: Number(forwarder),
        recipient_id: Number(recipient),
        // recipient_contact: recipientContact,
        date: `${date} 00:00:00`,
        quantity: Number(selectedGdn.total_quantity) || 0,
        total_cartons: actual_cartons,
        status,
        created_by: "admin", // TODO: replace with actual logged-in user
        gdn_id: selectedGdn.id,
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
      alert("Failed to save goods receive note.")
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
          onClick={() => router.push("/grn")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" disabled={isSaving} onClick={handleSave}>
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
                  Forwarder
                </Label>
                <Select value={forwarder} onValueChange={setForwarder}>
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Forwarder" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {forwarderOptions.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>
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
                      <SelectItem key={m.id} value={m.id}>
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
                    {recipientsList?.data?.map((m: any) => (
                      <SelectItem key={m.id} value={m.id}>
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
                    recipientsList?.data?.find((m: any) => m.id === recipient)
                      ?.contact_no ?? ""
                  }
                  placeholder="No phone number"
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                  value={lockedShipTo ?? ""}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: Quantity, Packing List */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="quantity"
                  className="text-xs font-medium text-foreground"
                >
                  Total Pieces
                </Label>
                <Input
                  id="quantity"
                  placeholder="Enter Quantity"
                  value={selectedPackingListRows[0]?.total_quantity ?? 0}
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
                  value={selectedPackingListRows[0]?.cartoons ?? 0}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="total-carton-count"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Carton Count
                </Label>
                <Input
                  id="total-carton-count"
                  placeholder="Enter Actual Carton Count"
                  value={actual_cartons}
                  onChange={(e) =>
                    setActualCartons(
                      e.target.value ? Number(e.target.value) : 0
                    )
                  }
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="total-carton-count"
                  className="text-xs font-medium text-foreground"
                >
                  Total Volume
                </Label>
                <Input
                  id="total-volume"
                  placeholder="Enter Total Volume"
                  value={selectedPackingListRows[0]?.gross_volume ?? 0}
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
                  value={selectedPackingListRows[0]?.gross_weight ?? 0}
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
              Available GDNs
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Select from the available GDNs to associate with this
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Cartons
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
                    {/* <TableHead className="text-xs font-medium text-zinc-400">
                      Actual Gross Weight
                    </TableHead> */}
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Gross Volume
                    </TableHead>
                    {/* <TableHead className="text-xs font-medium text-zinc-400">
                      Actual Gross Volume
                    </TableHead> */}
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
                          {row.cartoons}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.vehicle_no}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.transport_mode ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.container_no ?? "N/A"}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.gross_weight}
                        </TableCell>
                        {/* <TableCell className="text-sm text-zinc-300">
                          {row.actual_gross_weight}
                        </TableCell> */}
                        <TableCell className="text-sm text-zinc-300">
                          {row.gross_volume}
                        </TableCell>
                        {/* <TableCell className="text-sm text-zinc-300">
                          {row.actual_gross_volume}
                        </TableCell> */}
                        <TableCell>
                          {(() => {
                            const isDisabled =
                              !selectedRows.includes(row.id) &&
                              (selectedRows.length === 1 ||
                                (!!lockedShipTo &&
                                  row.ship_to !== lockedShipTo))

                            const checkboxEl = (
                              <Checkbox
                                checked={selectedRows.includes(row.id)}
                                disabled={isDisabled}
                                onCheckedChange={() => toggleRow(row.id)}
                                className="border-neutral-600"
                              />
                            )

                            if (!isDisabled) return checkboxEl

                            const reason =
                              selectedRows.length === 1
                                ? "Row already selected. Deselect the current row to select a different one."
                                : `Locked to Ship To (${lockedShipTo}). Deselect all rows to change.`

                            return (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="inline-flex cursor-not-allowed">
                                      {checkboxEl}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className="border-neutral-700 bg-[#0A0A0A] text-xs text-zinc-100">
                                    {reason}
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

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              GDN Measurements
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Total quantities, volumes, and weights derived from the selected
              GDN
            </p>
          </div>

          <div className="space-y-4">
            {selectedRows.length === 1 ? (
              (() => {
                const selectedGdn = rows.find(
                  (row) => row.id === selectedRows[0]
                )
                const measurements = selectedGdn?.measurements ?? []

                if (!measurements.length) {
                  return (
                    <p className="text-sm text-zinc-500">
                      No measurements available for this GDN.
                    </p>
                  )
                }

                return (
                  <div className="overflow-x-auto rounded-md border border-neutral-700">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-neutral-700 hover:bg-transparent">
                          <TableHead className="text-xs font-medium text-zinc-400">
                            Packages
                          </TableHead>
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
                        {measurements.map((m: any) => (
                          <TableRow
                            key={m.id}
                            className="border-neutral-800 hover:bg-neutral-800/40"
                          >
                            <TableCell className="text-sm text-zinc-100">
                              {m.packages ?? "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-zinc-300">
                              {m.length_cm ?? "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-zinc-300">
                              {m.width_cm ?? "N/A"}
                            </TableCell>
                            <TableCell className="text-sm text-zinc-300">
                              {m.height_cm ?? "N/A"}
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
                )
              })()
            ) : (
              <p className="text-sm text-zinc-500">
                Select a GDN row to view its measurements.
              </p>
            )}
          </div>
        </div>

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
                  Volume Weight
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
                      Volume Weight (kg)
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
                            type="button"
                            onClick={() => removeActualMeasurement(row.id)}
                            className="flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 p-2 text-red-600 dark:text-red-400 transition-colors hover:bg-red-100 dark:hover:bg-neutral-700"
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
                Total Actual Volume Weight:{" "}
                <span className="font-medium text-zinc-100">
                  {totalActualVolume.toFixed(4)} kg
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
  )
}
