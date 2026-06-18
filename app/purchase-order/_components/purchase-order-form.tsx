"use client"

import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CargoItem {
  id: string
  sku: string
  itemName: string
  color: string
  size: string
  countryOfOrigin: string
  unitCost: string
  quantity: string
  dispatchedQuantity: string
  cartons: string
  grossWeight: string
  netWeight: string
  ctnDimensions: string
  cbm: string
  open: boolean
}

type FreightMethod = "air" | "sea"

interface FreightSplit {
  id: string
  method: FreightMethod
  quantity: string
  dispatchDate: string
}

function createCargoItem(): CargoItem {
  return {
    id: crypto.randomUUID(),
    sku: "",
    itemName: "",
    color: "",
    size: "",
    countryOfOrigin: "",
    unitCost: "",
    quantity: "",
    dispatchedQuantity: "",
    cartons: "",
    grossWeight: "",
    netWeight: "",
    ctnDimensions: "",
    cbm: "",
    open: true,
  }
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

function FormFileInput({ label, id }: { label: string; id: string }) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-700 bg-[#0A0A0A] px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
        >
          Choose File
        </label>
        <input
          id={id}
          type="file"
          className="sr-only"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <span className="truncate text-xs text-neutral-500">
          {fileName ?? "No file chosen"}
        </span>
      </div>
    </div>
  )
}

function FormDateField({
  label,
  id,
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  label: string
  id: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 [&::-webkit-calendar-picker-indicator]:invert"
      />
    </div>
  )
}

function FreightSplitSection({
  poQuantity,
  splits,
  onChange,
  readOnly = false,
}: {
  poQuantity: string
  splits: FreightSplit[]
  onChange: (splits: FreightSplit[]) => void
  readOnly?: boolean
}) {
  const total = splits.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0)
  const poQty = parseInt(poQuantity) || 0
  const remaining = poQty - total
  const isValid = poQty > 0 && remaining === 0

  const addSplit = () => {
    onChange([
      ...splits,
      {
        id: crypto.randomUUID(),
        method: "sea",
        quantity: "",
        dispatchDate: "",
      },
    ])
  }

  const removeSplit = (id: string) => {
    onChange(splits.filter((s) => s.id !== id))
  }

  const updateSplit = (
    id: string,
    field: keyof FreightSplit,
    value: string
  ) => {
    onChange(splits.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  return (
    <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">
            Order Quantity Split
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Divide the PO quantity across freight methods. Total must equal PO
            quantity.
          </p>
        </div>
        {!readOnly && (
          <Button
            onClick={addSplit}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <IconPlus className="h-3.5 w-3.5" /> Add Split
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {splits.map((split, index) => (
          <div
            key={split.id}
            className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-3"
          >
            <FormSelect
              label={index === 0 ? "Freight Method" : ""}
              value={split.method}
              onValueChange={(v) => updateSplit(split.id, "method", v)}
              placeholder="Select Method"
              options={[
                { value: "air", label: "Air" },
                { value: "sea", label: "Sea" },
              ]}
              // disabled={readOnly}
            />
            <FormField
              label={index === 0 ? "Quantity" : ""}
              id={`split-qty-${split.id}`}
              placeholder="Enter Quantity"
              value={split.quantity}
              onChange={(v) => updateSplit(split.id, "quantity", v)}
              // disabled={readOnly}
            />
            <FormDateField
              label={index === 0 ? "Dispatch Date" : ""}
              id={`split-date-${split.id}`}
              value={split.dispatchDate}
              onChange={(v) => updateSplit(split.id, "dispatchDate", v)}
              disabled={readOnly}
            />
            {!readOnly && (
              <Button
                onClick={() => removeSplit(split.id)}
                variant="ghost"
                size="icon"
                className="mb-0 h-9 w-9 text-zinc-500 hover:text-red-400"
                disabled={splits.length === 1}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Summary row */}
      {poQty > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-800/50 px-4 py-2.5">
          <div className="flex gap-6 text-xs">
            <span className="text-zinc-400">
              PO Quantity:{" "}
              <span className="font-semibold text-zinc-100">{poQty}</span>
            </span>
            <span className="text-zinc-400">
              Allocated:{" "}
              <span className="font-semibold text-zinc-100">{total}</span>
            </span>
            <span className="text-zinc-400">
              Remaining:{" "}
              <span
                className={`font-semibold ${remaining === 0 ? "text-green-400" : remaining < 0 ? "text-red-400" : "text-yellow-400"}`}
              >
                {remaining}
              </span>
            </span>
          </div>
          <span
            className={`text-xs font-medium ${isValid ? "text-green-400" : "text-yellow-400"}`}
          >
            {isValid ? "✓ Fully allocated" : "Allocation incomplete"}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PurchaseOrderForm() {
  // PO Info
  const [poNumber, setPoNumber] = useState("")
  const [poQuantity, setPoQuantity] = useState("")
  const [supplier, setSupplier] = useState("")
  const [freightForwarder, setFreightForwarder] = useState("")
  const [shippingMode, setShippingMode] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [finalDestination, setFinalDestination] = useState("")

  // Timeline
  const [exFactoryDate, setExFactoryDate] = useState("")
  const [actualDeliveryDate, setActualDeliveryDate] = useState("")
  const [instructions, setInstructions] = useState("")

  // Cargo
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([createCargoItem()])

  const [freightSplits, setFreightSplits] = useState<FreightSplit[]>([
    { id: crypto.randomUUID(), method: "sea", quantity: "", dispatchDate: "" },
  ])

  const addItem = () => setCargoItems((prev) => [...prev, createCargoItem()])

  const deleteItem = (id: string) =>
    setCargoItems((prev) => prev.filter((item) => item.id !== id))

  const toggleItem = (id: string) =>
    setCargoItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, open: !item.open } : item
      )
    )

  const updateItem = (id: string, field: keyof CargoItem, value: string) =>
    setCargoItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )

  return (
    <div className="mx-auto space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Purchase Order Information */}
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Purchase Order Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Basic purchase order, supplier, and shipping information.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="PO Number"
                id="po-number"
                placeholder="Enter PO Number"
                value={poNumber}
                onChange={setPoNumber}
                className="col-span-1"
              />
              <FormField
                label="PO Quantity"
                id="po-quantity"
                placeholder="Enter PO Quantity"
                value={poQuantity}
                onChange={setPoQuantity}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Supplier"
                id="supplier"
                placeholder="Enter Supplier"
                value={supplier}
                onChange={setSupplier}
              />
              <FormField
                label="Freight Forwarder"
                id="freight-forwarder"
                placeholder="Freight Forwarder"
                value={freightForwarder}
                onChange={setFreightForwarder}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Shipping Mode"
                id="shipping-mode"
                placeholder="Enter Shipping Mode"
                value={shippingMode}
                onChange={setShippingMode}
              />
              <FormField
                label="Payment Mode"
                id="payment-mode"
                placeholder="Enter Payment Mode"
                value={paymentMode}
                onChange={setPaymentMode}
              />
            </div>

            <FormField
              label="Final Destination"
              id="final-destination"
              placeholder="Enter Final Destination"
              value={finalDestination}
              onChange={setFinalDestination}
              className="max-w-[calc(50%-8px)]"
            />
          </div>
        </div>

        {/* Timeline & Documentation */}
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Timeline &amp; Documentation
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Important dates, documents, and shipment instructions.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Ex Factory Date"
                value={exFactoryDate}
                onValueChange={setExFactoryDate}
                placeholder="Ex Factory Date"
                options={[
                  { value: "q1", label: "Q1 2025" },
                  { value: "q2", label: "Q2 2025" },
                  { value: "q3", label: "Q3 2025" },
                  { value: "q4", label: "Q4 2025" },
                ]}
              />
              <FormSelect
                label="Actual Delivery Date"
                value={actualDeliveryDate}
                onValueChange={setActualDeliveryDate}
                placeholder="Actual Delivery Date"
                options={[
                  { value: "jan", label: "January 2025" },
                  { value: "feb", label: "February 2025" },
                  { value: "mar", label: "March 2025" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormFileInput label="PO Document" id="po-document" />
              <FormTextarea
                label="Instructions"
                value={instructions}
                onChange={setInstructions}
                placeholder="Type your message here."
              />
            </div>
          </div>
        </div>
      </div>

      <FreightSplitSection
        poQuantity={poQuantity}
        splits={freightSplits}
        onChange={setFreightSplits}
        // readOnly={readOnly}
      />

      {/* ── Row 2: Cargo Items ───────────────────────────────────────────── */}
      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Cargo Item</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Commercial, packaging, and measurement details for this shipment
              item.
            </p>
          </div>
          <Button
            onClick={addItem}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-md border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
          >
            <IconPlus className="h-3.5 w-3.5" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {cargoItems.map((item, index) => (
            <Collapsible
              key={item.id}
              open={item.open}
              onOpenChange={() => toggleItem(item.id)}
            >
              <div className="overflow-hidden rounded-lg border border-zinc-800">
                {/* Accordion Header */}
                <CollapsibleTrigger asChild>
                  <button className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-800/50">
                    <span className="text-sm font-medium text-zinc-300">
                      Cargo Item {index + 1}
                    </span>
                    {item.open ? (
                      <IconChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <IconChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </button>
                </CollapsibleTrigger>

                {/* Accordion Content */}
                <CollapsibleContent>
                  <div className="space-y-4 border-t border-zinc-800 px-4 pt-4 pb-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <FormField
                        label="SKU"
                        id={`sku-${item.id}`}
                        placeholder="Enter SKU"
                        value={item.sku}
                        onChange={(v) => updateItem(item.id, "sku", v)}
                      />
                      <FormField
                        label="Item Name"
                        id={`item-name-${item.id}`}
                        placeholder="Enter Item Name"
                        value={item.itemName}
                        onChange={(v) => updateItem(item.id, "itemName", v)}
                      />
                      <FormField
                        label="Color"
                        id={`color-${item.id}`}
                        placeholder="Enter Color"
                        value={item.color}
                        onChange={(v) => updateItem(item.id, "color", v)}
                      />
                      <FormField
                        label="Size"
                        id={`size-${item.id}`}
                        placeholder="Enter Size"
                        value={item.size}
                        onChange={(v) => updateItem(item.id, "size", v)}
                      />
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <FormField
                        label="Country of Origin"
                        id={`coo-${item.id}`}
                        placeholder="Enter Country of Origin"
                        value={item.countryOfOrigin}
                        onChange={(v) =>
                          updateItem(item.id, "countryOfOrigin", v)
                        }
                      />
                      <FormField
                        label="Unit Cost"
                        id={`unit-cost-${item.id}`}
                        placeholder="Enter Unit Cost"
                        value={item.unitCost}
                        onChange={(v) => updateItem(item.id, "unitCost", v)}
                      />
                      <FormField
                        label="Quantity"
                        id={`quantity-${item.id}`}
                        placeholder="Enter Quantity"
                        value={item.quantity}
                        onChange={(v) => updateItem(item.id, "quantity", v)}
                      />
                      <FormField
                        label="Dispatched Quantity"
                        id={`dispatched-${item.id}`}
                        placeholder="Enter Dispatched Quantity"
                        value={item.dispatchedQuantity}
                        onChange={(v) =>
                          updateItem(item.id, "dispatchedQuantity", v)
                        }
                      />
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <FormField
                        label="Cartons"
                        id={`cartons-${item.id}`}
                        placeholder="Enter Cartons"
                        value={item.cartons}
                        onChange={(v) => updateItem(item.id, "cartons", v)}
                      />
                      <FormField
                        label="Gross Weight"
                        id={`gross-weight-${item.id}`}
                        placeholder="Enter Gross Weight"
                        value={item.grossWeight}
                        onChange={(v) => updateItem(item.id, "grossWeight", v)}
                      />
                      <FormField
                        label="Net Weight"
                        id={`net-weight-${item.id}`}
                        placeholder="Enter Net Weight"
                        value={item.netWeight}
                        onChange={(v) => updateItem(item.id, "netWeight", v)}
                      />
                      <FormField
                        label="CTN Dimensions"
                        id={`ctn-dims-${item.id}`}
                        placeholder="Enter CTN Dimensions"
                        value={item.ctnDimensions}
                        onChange={(v) =>
                          updateItem(item.id, "ctnDimensions", v)
                        }
                      />
                    </div>

                    {/* Row 4: CBM + Delete */}
                    <div className="flex items-end justify-between gap-4">
                      <FormField
                        label="CBM"
                        id={`cbm-${item.id}`}
                        placeholder="Enter CBM"
                        value={item.cbm}
                        onChange={(v) => updateItem(item.id, "cbm", v)}
                        className="w-[calc(25%-12px)]"
                      />
                      <Button
                        onClick={() => deleteItem(item.id)}
                        variant="destructive"
                        size="sm"
                        className="mb-0 h-9 gap-1.5 rounded-md bg-red-500! text-xs text-white hover:bg-red-500"
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                        Delete Item
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  )
}
