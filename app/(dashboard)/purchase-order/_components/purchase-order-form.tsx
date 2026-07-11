"use client"

import FreightSplitSection, {
  FreightSplit,
} from "@/components/custom/FreightSplitSection"
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { fetchClients } from "@/lib/api/clients"
import { createPurchaseOrder } from "@/lib/api/purchase-orders"
import {
  IconCalendarFilled,
  IconChevronDown,
  IconChevronUp,
  IconFileSpreadsheet,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { format, isValid, parse } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useId, useMemo, useState } from "react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CargoItem {
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
  status: string
  open: boolean
}

export function createCargoItem(id: string): CargoItem {
  return {
    id,
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
    status: "Pending",
    open: true,
  }
}

const SHIPPING_MODE_OPTIONS = [
  { value: "Sea", label: "Sea" },
  { value: "Air", label: "Air" },
  { value: "Road", label: "Road" },
  { value: "Courier", label: "Courier" },
]

const PAYMENT_MODE_OPTIONS = [
  { value: "LC/TT", label: "LC/TT" },
  { value: "T/T", label: "T/T" },
  { value: "LC", label: "LC" },
  { value: "CAD", label: "CAD" },
  { value: "Open Account", label: "Open Account" },
]

const ITEM_STATUS_OPTIONS = [
  { value: "Pending", label: "Pending" },
  { value: "In Production", label: "In Production" },
  { value: "Ready", label: "Ready" },
  { value: "Dispatched", label: "Dispatched" },
  { value: "Completed", label: "Completed" },
]

export default function PurchaseOrderForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const initialCargoId = useId()

  // PO Info
  const [poNumber, setPoNumber] = useState("")
  const [poQuantity, setPoQuantity] = useState("")
  const [supplier, setSupplier] = useState("")
  const [freightForwarder, setFreightForwarder] = useState("")
  const [paymentMode, setPaymentMode] = useState("")
  const [finalDestination, setFinalDestination] = useState("")
  const [shippingMode, setShippingMode] = useState("")

  // Timeline
  const [exFactoryDate, setExFactoryDate] = useState("")
  const [instructions, setInstructions] = useState("")

  // Cargo
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([
    createCargoItem(initialCargoId),
  ])

  const [remarks, setRemarks] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const supplierOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === "manufacturer") || []
    )
  }, [data])

  const freightForwarderOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === "forwarder") || []
    )
  }, [data])

  const [freightSplits, setFreightSplits] = useState<FreightSplit[]>([
    { id: initialCargoId, method: "sea", quantity: "", dispatchDate: "" },
  ])

  const addItem = () =>
    setCargoItems((prev) => [...prev, createCargoItem(crypto.randomUUID())])

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

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await createPurchaseOrder({
        poNumber,
        poQuantity,
        supplier,
        freightForwarder,
        paymentMode,
        finalDestination,
        shippingMode,
        exFactoryDate,
        instructions,
        cargoItems,
        freightSplits,
        remarks,
      })
      router.push("/purchase-order")
    } catch (err) {
      console.error(err)
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
          onClick={() => router.push("/purchase-order")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
      </div>

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
            {/* Row 1: PO Number + PO Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-1">
                <Label htmlFor="po-number" className="text-xs font-medium text-foreground">PO Number</Label>
                <Input
                  id="po-number"
                  placeholder="Enter PO Number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="po-quantity" className="text-xs font-medium text-foreground">PO Quantity</Label>
                <Input
                  id="po-quantity"
                  placeholder="Enter PO Quantity"
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            {/* Row 2: Supplier + Freight Forwarder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Supplier</Label>
                <Select
                  value={supplier}
                  onValueChange={setSupplier}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {supplierOptions.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Freight Forwarder</Label>
                <Select
                  value={freightForwarder}
                  onValueChange={setFreightForwarder}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Select Freight Forwarder" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {freightForwarderOptions.map((f: any) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Payment Mode + Shipping Mode */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Payment Mode</Label>
                <Select
                  value={paymentMode}
                  onValueChange={setPaymentMode}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Select Payment Mode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {PAYMENT_MODE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Shipping Mode</Label>
                <Select
                  value={shippingMode}
                  onValueChange={setShippingMode}
                >
                  <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                    <SelectValue placeholder="Select Shipping Mode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                    {SHIPPING_MODE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 4: Final Destination */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="final-destination" className="text-xs font-medium text-foreground">Final Destination</Label>
                <Input
                  id="final-destination"
                  placeholder="Enter Final Destination"
                  value={finalDestination}
                  onChange={(e) => setFinalDestination(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ex-factory-date" className="text-xs font-medium text-foreground">Ex Factory Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="ex-factory-date"
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start rounded-md border-neutral-700 bg-[#0A0A0A] pl-3 text-left text-sm font-normal text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500",
                        !exFactoryDate && "text-zinc-500"
                      )}
                    >
                     .{exFactoryDate ? (() => {
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
                        const selectedDate = parseDate(exFactoryDate)
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
                        return parseDate(exFactoryDate)
                      })()}
                      onSelect={(date) => {
                        if (date) {
                          setExFactoryDate(format(date, "yyyy-MM-dd"))
                        }
                      }}
                      captionLayout="dropdown"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">PO Document</Label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="po-document"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-neutral-700 bg-[#0A0A0A] px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:bg-neutral-700"
                  >
                    Choose File
                  </label>
                  <input
                    id="po-document"
                    type="file"
                    className="sr-only"
                  />
                  <span className="truncate text-xs text-neutral-500">
                    No file chosen
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Instructions</Label>
                <Textarea
                  placeholder="Type your message here."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <FreightSplitSection
        poQuantity={poQuantity}
        splits={freightSplits}
        onChange={setFreightSplits}
      />

      {/* ── Cargo Items ───────────────────────────────────────────────────────── */}
      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Cargo Items</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Commercial, packaging, and measurement details for this shipment
              item.
            </p>
          </div>
          <div className="flex gap-4">
            <>
              <input
                id="cargo-file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    console.log(file)
                  }
                }}
              />
              <label htmlFor="cargo-file-upload">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
                >
                  <span>
                    <IconFileSpreadsheet className="h-3.5 w-3.5" />
                    Upload File
                  </span>
                </Button>
              </label>
            </>
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
                      {item.itemName
                        ? `${item.itemName}${item.sku ? ` (${item.sku})` : ""}`
                        : `Cargo Item ${index + 1}`}
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
                    {/* Row 1: SKU, Item Name, Color, Size */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`sku-${item.id}`} className="text-xs font-medium text-foreground">SKU</Label>
                        <Input
                          id={`sku-${item.id}`}
                          placeholder="Enter SKU"
                          value={item.sku}
                          onChange={(e) => updateItem(item.id, "sku", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`item-name-${item.id}`} className="text-xs font-medium text-foreground">Item Name</Label>
                        <Input
                          id={`item-name-${item.id}`}
                          placeholder="Enter Item Name"
                          value={item.itemName}
                          onChange={(e) => updateItem(item.id, "itemName", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`color-${item.id}`} className="text-xs font-medium text-foreground">Color</Label>
                        <Input
                          id={`color-${item.id}`}
                          placeholder="Enter Color"
                          value={item.color}
                          onChange={(e) => updateItem(item.id, "color", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`size-${item.id}`} className="text-xs font-medium text-foreground">Size</Label>
                        <Input
                          id={`size-${item.id}`}
                          placeholder="Enter Size"
                          value={item.size}
                          onChange={(e) => updateItem(item.id, "size", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Row 2: Country of Origin, Unit Cost, Quantity, Dispatched Qty */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`coo-${item.id}`} className="text-xs font-medium text-foreground">Country of Origin</Label>
                        <Input
                          id={`coo-${item.id}`}
                          placeholder="Enter Country of Origin"
                          value={item.countryOfOrigin}
                          onChange={(e) => updateItem(item.id, "countryOfOrigin", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`unit-cost-${item.id}`} className="text-xs font-medium text-foreground">Unit Cost</Label>
                        <Input
                          id={`unit-cost-${item.id}`}
                          placeholder="Enter Unit Cost"
                          value={item.unitCost}
                          onChange={(e) => updateItem(item.id, "unitCost", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`quantity-${item.id}`} className="text-xs font-medium text-foreground">Quantity</Label>
                        <Input
                          id={`quantity-${item.id}`}
                          placeholder="Enter Quantity"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`dispatched-${item.id}`} className="text-xs font-medium text-foreground">Dispatched Quantity</Label>
                        <Input
                          id={`dispatched-${item.id}`}
                          placeholder="Enter Dispatched Quantity"
                          value={item.dispatchedQuantity}
                          onChange={(e) => updateItem(item.id, "dispatchedQuantity", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Row 3: Cartons, Gross Weight, Net Weight, CTN Dimensions */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`cartons-${item.id}`} className="text-xs font-medium text-foreground">Cartons</Label>
                        <Input
                          id={`cartons-${item.id}`}
                          placeholder="Enter Cartons"
                          value={item.cartons}
                          onChange={(e) => updateItem(item.id, "cartons", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`gross-weight-${item.id}`} className="text-xs font-medium text-foreground">Gross Weight</Label>
                        <Input
                          id={`gross-weight-${item.id}`}
                          placeholder="Enter Gross Weight"
                          value={item.grossWeight}
                          onChange={(e) => updateItem(item.id, "grossWeight", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`net-weight-${item.id}`} className="text-xs font-medium text-foreground">Net Weight</Label>
                        <Input
                          id={`net-weight-${item.id}`}
                          placeholder="Enter Net Weight"
                          value={item.netWeight}
                          onChange={(e) => updateItem(item.id, "netWeight", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`ctn-dims-${item.id}`} className="text-xs font-medium text-foreground">CTN Dimensions</Label>
                        <Input
                          id={`ctn-dims-${item.id}`}
                          placeholder="e.g. 10x10x10"
                          value={item.ctnDimensions}
                          onChange={(e) => updateItem(item.id, "ctnDimensions", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                    </div>

                    {/* Row 4: CBM, Status, Delete */}
                    <div className="flex items-end gap-4">
                      <div className="flex flex-col gap-1.5 w-[calc(25%-12px)]">
                        <Label htmlFor={`cbm-${item.id}`} className="text-xs font-medium text-foreground">CBM</Label>
                        <Input
                          id={`cbm-${item.id}`}
                          placeholder="Enter CBM"
                          value={item.cbm}
                          onChange={(e) => updateItem(item.id, "cbm", e.target.value)}
                          className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 w-[calc(25%-12px)]">
                        <Label className="text-xs font-medium text-foreground">Status</Label>
                        <Select
                          value={item.status}
                          onValueChange={(v) => updateItem(item.id, "status", v)}
                        >
                          <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
                            {ITEM_STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="mb-0 ml-auto">
                        <Button
                          onClick={() => deleteItem(item.id)}
                          variant="destructive"
                          size="sm"
                          className="h-9 gap-1.5 rounded-md bg-red-500! text-xs text-white hover:bg-red-600"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                          Delete Item
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
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
