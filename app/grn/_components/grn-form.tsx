"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { useState } from "react"

interface PackingListRow {
  packingListNo: string
  client: string
  manufacturer: string
  date: string
  quantity: number
  gdnNo: string
  status: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormField({
  label,
  id,
  placeholder,
  value,
  onChange,
  className = "",
}: {
  label: string
  id: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
      />
    </div>
  )
}

function FormSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: {
  label: string
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500"
      />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoodsReceiveNoteForm() {
  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [quantity, setQuantity] = useState("")
  const [packingList, setPackingList] = useState("")
  const [remarks, setRemarks] = useState("")

  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const toggleRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const rows: PackingListRow[] = [
    {
      packingListNo: "W0258",
      client: "Woxer",
      manufacturer: "Brandix",
      date: "28 May 2026",
      quantity: 300,
      gdnNo: "SUP-001",
      status: "Active",
    },
  ]

  return (
    <div className="mx-auto space-y-5">
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
              <FormSelect
                label="Date"
                value={date}
                onValueChange={setDate}
                placeholder="Date"
                options={[
                  { value: "jan", label: "January 2025" },
                  { value: "feb", label: "February 2025" },
                  { value: "mar", label: "March 2025" },
                ]}
              />
              <FormSelect
                label="Client"
                value={client}
                onValueChange={setClient}
                placeholder="Choose Client"
                options={[
                  { value: "client1", label: "Client 1" },
                  { value: "client2", label: "Client 2" },
                  { value: "client3", label: "Client 3" },
                ]}
              />
              <FormSelect
                label="Forwarder"
                value={forwarder}
                onValueChange={setForwarder}
                placeholder="Choose Forwarder"
                options={[
                  { value: "forwarder1", label: "Forwarder 1" },
                  { value: "forwarder2", label: "Forwarder 2" },
                  { value: "forwarder3", label: "Forwarder 3" },
                ]}
              />
              <FormSelect
                label="Manufacturer"
                value={manufacturer}
                onValueChange={setManufacturer}
                placeholder="Choose Manufacturer"
                options={[
                  { value: "manufacturer1", label: "Manufacturer 1" },
                  { value: "manufacturer2", label: "Manufacturer 2" },
                  { value: "manufacturer3", label: "Manufacturer 3" },
                ]}
              />
            </div>

            {/* Row 2: Quantity, Packing List */}
            <div className="grid grid-cols-4 gap-4">
              <FormField
                label="Quantity"
                id="quantity"
                placeholder="Enter Quantity"
                value={quantity}
                onChange={setQuantity}
              />
              <FormField
                label="Packing List"
                id="packing-list"
                placeholder="Enter Packing List"
                value={packingList}
                onChange={setPackingList}
              />
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
                      Client
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Manufacturer
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
                    rows.map((row, index) => (
                      <TableRow
                        key={index}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-100">
                          {row.packingListNo}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.client}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.manufacturer}
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
                            checked={selectedRows.includes(`${index}`)}
                            onCheckedChange={() => toggleRow(`${index}`)}
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
              <FormTextarea
                label="Remarks"
                value={remarks}
                onChange={setRemarks}
                placeholder="Type your message here."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
