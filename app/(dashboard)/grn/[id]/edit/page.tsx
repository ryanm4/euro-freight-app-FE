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
import {
  fetchGoodsReceiveNoteById,
  updateGoodsReceiveNote,
} from "@/lib/api/goods_receive_notes"
import { fetchPackingLists } from "@/lib/api/packing_lists"
import { fetchRecipients } from "@/lib/api/recipients"
import { UserRole } from "@/lib/enums/user-role"
import { cn } from "@/lib/utils"
import { IconCalendarFilled } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format, isValid, parse } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

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

  const { data: grnRes, isLoading: isGrnLoading } = useQuery({
    queryKey: ["grn", id],
    queryFn: () => fetchGoodsReceiveNoteById(id),
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

  const toggleRow = (rowId: number) => {
    setSelectedRows((prev) => {
      // Always allow unchecking
      if (prev.includes(rowId)) {
        return prev.filter((r) => r !== rowId)
      }

      const row = rows.find((r) => r.id === rowId)
      if (!row) return prev

      // If something is already selected, block a different shipping mode
      if (lockedShippingMode && row.shippingMode !== lockedShippingMode) {
        alert(
          `You can only select packing lists with the same Shipping Mode (${lockedShippingMode}).`
        )
        return prev
      }

      return [...prev, rowId]
    })
  }

  // Rows available for selection, sourced from the "completed" packing
  // lists endpoint.
  const availableRows: PackingListRow[] = useMemo(() => {
    return (
      packingLists?.data?.map((pl: any) => ({
        id: pl.packing_list_id,
        packingListNo: pl.packing_list_no ?? "",
        documentDate: pl.document_date
          ? format(new Date(pl.document_date), "dd/MMM/yy HH:mm")
          : "N/A",
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

  const linkedRows: PackingListRow[] = useMemo(() => {
    return (
      grnRes?.data?.packing_lists?.map((pl: any) => ({
        id: pl.id,
        packingListNo: pl.packing_list_no ?? `PL-${pl.id}`,
        documentDate: pl.date ? format(new Date(pl.date), "dd/MMM/yy") : "N/A",
        shipTo: pl.ship_to ?? "",
        shippingMode: pl.shipping_mode ?? "",
        totalCartons: pl.total_cartons ?? 0,
        totalCbm: pl.total_cbm ?? "0",
        totalNetWeightKg: pl.total_net_weight_kg ?? "0",
        totalQuantity: pl.total_quantity ?? 0,
        totalVolume: pl.total_volume ?? "0",
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
    return selectedPackingListRows[0]?.shippingMode ?? null
  }, [selectedPackingListRows])

  const totalCartonCount = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + (row.totalCartons ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

  const totalVolume = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + Number(row.totalVolume ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

  const totalGrossWeight = useMemo(
    () =>
      selectedRows.reduce((accumulator, rowId) => {
        const packingList = packingLists?.data?.find(
          (pl: any) => pl.packing_list_id === rowId
        )
        return accumulator + Number(packingList?.total_gross_weight_kg ?? 0)
      }, 0),
    [selectedRows, packingLists]
  )

  const quantity = useMemo(
    () =>
      selectedPackingListRows.reduce(
        (accumulator, row) => accumulator + Number(row.totalQuantity ?? 0),
        0
      ),
    [selectedPackingListRows]
  )

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
    setSelectedRows(grn.packing_lists?.map((pl: any) => pl.id) ?? [])

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
          title={`${grnRes?.data?.grn_no ?? ""}`}
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
                            {(() => {
                              const isDisabled =
                                !!lockedShippingMode &&
                                row.shippingMode !== lockedShippingMode &&
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
                                      Shipping Mode locked to{" "}
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
