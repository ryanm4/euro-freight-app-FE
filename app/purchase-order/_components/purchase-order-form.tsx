"use client"

import FreightSplitSection, {
  FreightSplit,
} from "@/components/custom/FreightSplitSection"
import FormDateField from "@/components/shared/FormDateField"
import FormField from "@/components/shared/FormField"
import FormFileInput from "@/components/shared/FormFileInput"
import FormSelect from "@/components/shared/FormSelect"
import FormTextarea from "@/components/shared/FormTextarea"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { fetchClients } from "@/lib/api/clients"
import { createPurchaseOrder } from "@/lib/api/purchase-orders"
import {
  IconChevronDown,
  IconChevronUp,
  IconFileSpreadsheet,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useId, useMemo, useState } from "react"

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

function createCargoItem(id: string): CargoItem {
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
    open: true,
  }
}

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

  // Timeline
  const [exFactoryDate, setExFactoryDate] = useState("")
  // const [actualDeliveryDate, setActualDeliveryDate] = useState("")
  const [instructions, setInstructions] = useState("")

  // Cargo
  const [cargoItems, setCargoItems] = useState<CargoItem[]>([
    createCargoItem(initialCargoId),
  ])

  const [remarks, setRemarks] = useState("")

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  console.log("data", data)

  const supplierOptions = useMemo(() => {
    return data?.data?.filter((client: any) => client.type === "supplier") || []
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === "manufacturer") || []
    )
  }, [data])

  console.log("supplierOptions", supplierOptions)
  console.log("manufacturerOptions", manufacturerOptions)

  const [freightSplits, setFreightSplits] = useState<FreightSplit[]>([
    { id: initialCargoId, method: "sea", quantity: "", dispatchDate: "" },
  ])

  const addItem = () =>
    setCargoItems((prev) => [...prev, createCargoItem(initialCargoId)])

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
        exFactoryDate,
        // actualDeliveryDate,
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="PO Number"
                id="po-number"
                placeholder="Enter PO Number"
                value={poNumber}
                onChange={setPoNumber}
                className="col-span-1"
                type="number"
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
              <FormSelect
                label="Supplier"
                value={supplier}
                onValueChange={setSupplier}
                placeholder="Select Supplier"
                options={supplierOptions.map((s: any) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />
              <FormSelect
                label="Manufacturer"
                value={freightForwarder}
                onValueChange={setFreightForwarder}
                placeholder="Select Manufacturer"
                options={manufacturerOptions.map((m: any) => ({
                  value: m.id,
                  label: m.name,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Payment Mode"
                id="payment-mode"
                placeholder="Enter Payment Mode"
                value={paymentMode}
                onChange={setPaymentMode}
              />

              <FormField
                label="Final Destination"
                id="final-destination"
                placeholder="Enter Final Destination"
                value={finalDestination}
                onChange={setFinalDestination}
              />
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
              <FormDateField
                label="Ex Factory Date"
                id={`ex-factory-date`}
                value={exFactoryDate}
                onChange={setExFactoryDate}
              />
              <FormFileInput label="PO Document" id="po-document" />
            </div>

            <div className="grid grid-cols-1 gap-4">
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
