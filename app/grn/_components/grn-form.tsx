"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState } from "react"

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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoodsReceiveNoteForm() {
  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [quantity, setQuantity] = useState("")
  const [packingList, setPackingList] = useState("")

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
      </div>
    </div>
  )
}
