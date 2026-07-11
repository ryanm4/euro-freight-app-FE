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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchClients } from "@/lib/api/clients"
import { createGoodsDispatchNote } from "@/lib/api/goods_dispatch_notes"
import { fetchPackingLists } from "@/lib/api/packing_lists"
import { IconCalendarFilled } from "@tabler/icons-react"
import { format, isValid, parse } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

interface PackingListRow {
  id: number
  packingListNo: string
  client: string
  poNumber: string
  date: string
  quantity: number
  gdnNo: string
  status: string
}

export default function GoodsDispatchNoteForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [date, setDate] = useState("")
  const [gdnReference, setGdnReference] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [client, setClient] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [cartons, setCartons] = useState("")
  // const [actualCartons, setActualCartons] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [actualGrossWeight, setActualGrossWeight] = useState("")
  const [grossVolume, setGrossVolume] = useState("")
  const [actualGrossVolume, setActualGrossVolume] = useState("")
  const [remarks, setRemarks] = useState("")

  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const { data: packingLists } = useQuery({
    queryKey: ["packingLists"],
    queryFn: fetchPackingLists,
  })

  const supplierOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === "client") || []
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === "manufacturer") || []
  }, [data])

  const forwarderOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === "forwarder") || []
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
        client: pl.client_id,
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

  const handleSave = async () => {
    if (!client || !manufacturer || !forwarder || !date) {
      alert("Please fill in Date, Client, Manufacturer, and Forwarder.")
      return
    }
    if (selectedRows.length === 0) {
      alert("Please select at least one packing list.")
      return
    }

    try {
      setIsSaving(true)
      await createGoodsDispatchNote({
        client,
        manufacturer,
        forwarder,
        date,
        selectedRows,
        cartons,
        // actualCartons,
        grossWeight,
        actualGrossWeight,
        grossVolume,
        actualGrossVolume,
        gdnReference,
        vehicleNo,
      })
      router.push("/gdn")
    } catch (err) {
      console.error(err)
      alert("Failed to save goods dispatch note.")
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
              Core shipment and transport information.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date" className="text-xs font-medium text-foreground">Date</Label>
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
                      {date ? (() => {
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
                        const selectedDate = parseDate(date)
                        return selectedDate ? format(selectedDate, "PPP") : "Pick a date"
                      })() : "Pick a date"}
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
                <Label htmlFor="gdn-reference" className="text-xs font-medium text-foreground">GDN/GRN Reference</Label>
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
                <Label htmlFor="vehicle-no" className="text-xs font-medium text-foreground">Vehicle No</Label>
                <Input
                  id="vehicle-no"
                  placeholder="Enter Vehicle No"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
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
              Organizations involved in the shipment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Client</Label>
                <Select
                  value={client}
                  onValueChange={setClient}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Client" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {supplierOptions.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Manufacturer</Label>
                <Select
                  value={manufacturer}
                  onValueChange={setManufacturer}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Manufacturer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {manufacturerOptions.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Forwarder</Label>
                <Select
                  value={forwarder}
                  onValueChange={setForwarder}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Choose Forwarder" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {forwarderOptions.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
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
              Packing Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Packing lists and carton quantities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cartons" className="text-xs font-medium text-foreground">Cartons</Label>
                <Input
                  id="cartons"
                  placeholder="Enter Cartons"
                  value={cartons}
                  onChange={(e) => setCartons(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              {/* <div className="flex flex-col gap-1.5">
                <Label htmlFor="actual-cartons" className="text-xs font-medium text-foreground">Actual Cartons</Label>
                <Input
                  id="actual-cartons"
                  placeholder="Enter Actual Cartons"
                  value={actualCartons}
                  onChange={(e) => setActualCartons(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div> */}
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
                <Label htmlFor="gross-weight" className="text-xs font-medium text-foreground">Gross Weight</Label>
                <Input
                  id="gross-weight"
                  placeholder="Enter Gross Weight"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="actual-gross-weight" className="text-xs font-medium text-foreground">Actual Gross Weight</Label>
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
                <Label htmlFor="gross-volume" className="text-xs font-medium text-foreground">Gross Volume</Label>
                <Input
                  id="gross-volume"
                  placeholder="Enter Gross Volume"
                  value={grossVolume}
                  onChange={(e) => setGrossVolume(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="actual-gross-volume" className="text-xs font-medium text-foreground">Actual Gross Volume</Label>
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
              Select from the available packing lists to associate with this
              dispatch.
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
                          {row.client}
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
                        colSpan={8}
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
                <Label className="text-xs font-medium text-foreground">Remarks</Label>
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
