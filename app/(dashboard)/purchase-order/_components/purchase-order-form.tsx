"use client"

import { Button } from "@/components/ui/button"
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
import { createPurchaseOrder } from "@/lib/api/purchase-orders"
import { useUploadThing } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DataTable } from "./purchase-order-table"
import { purchaseOrderUploadColumns } from "./purchase-order-upload-columns"

const STATUS_OPTIONS = ["Draft", "Saved", "Completed"]

export default function PurchaseOrderForm({
  initialData,
  sourceFile,
}: {
  initialData?: any
  sourceFile?: any
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const { startUpload } = useUploadThing("purchaseOrderUploader")

  // PO Info
  const [poNumber, setPoNumber] = useState(initialData?.poNumber ?? "-")
  const [poQuantity, setPoQuantity] = useState(
    initialData?.totals?.totalQty ?? "0"
  )
  const [supplier, setSupplier] = useState(initialData?.vendor?.name ?? "")
  const [finalDestination, setFinalDestination] = useState(
    initialData?.shipTo?.addressLines?.[0] ?? ""
  )
  const [status, setStatus] = useState("Draft")

  // Timeline
  const getExFactoryDate = () => {
    const exFactoryNote = initialData?.comments?.notes?.find((item: any) =>
      item.startsWith("Ex-Factory")
    )
    return exFactoryNote?.split(": ")[1] || ""
  }
  const [exFactoryDate, setExFactoryDate] = useState(getExFactoryDate())
  const [instructions, setInstructions] = useState(
    initialData?.comments?.contact ?? ""
  )

  const handleSave = async () => {
    try {
      setIsSaving(true)

      let fileUrl = ""

      // Upload original PO file
      if (sourceFile) {
        const uploadedFiles = await startUpload([sourceFile])

        const uploadedFile = uploadedFiles?.[0]

        if (!uploadedFile) {
          throw new Error("Failed to upload original PO file")
        }

        fileUrl = uploadedFile.ufsUrl
      }

      await createPurchaseOrder({
        ...initialData,
        filePath: fileUrl,
        created_by: "Anupa",
        packingListId: null,
        hblNos: null,
        dcInHouseDate: null,
        exFactoryDate: initialData?.comments?.notes
          .find((item: any) => item.startsWith("Ex-Factory"))
          ?.split(": ")[1],
        status: status,
      })

      router.push("/purchase-order")
    } catch (err) {
      console.error("Failed to save purchase order:", err)
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

      <div className="grid grid-cols-1 gap-5">
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
              <div className="col-span-1 flex flex-col gap-1.5">
                <Label
                  htmlFor="po-number"
                  className="text-xs font-medium text-foreground"
                >
                  PO Number
                </Label>
                <Input
                  id="po-number"
                  placeholder="Enter PO Number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="po-quantity"
                  className="text-xs font-medium text-foreground"
                >
                  Total Quantity
                </Label>
                <Input
                  id="po-quantity"
                  placeholder="Enter PO Quantity"
                  value={poQuantity}
                  onChange={(e) => setPoQuantity(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>
            </div>

            {/* Row 2: Supplier + Freight Forwarder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="supplier-name"
                  className="text-xs font-medium text-foreground"
                >
                  Supplier Name
                </Label>
                <Input
                  id="supplier-name"
                  placeholder="Enter Supplier Name"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="final-destination"
                  className="text-xs font-medium text-foreground"
                >
                  Final Destination
                </Label>
                <Input
                  id="final-destination"
                  placeholder="Enter Final Destination"
                  value={finalDestination}
                  onChange={(e) => setFinalDestination(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="ex-factory-date"
                  className="text-xs font-medium text-foreground"
                >
                  Ex-Factory Date
                </Label>
                <Input
                  id="ex-factory-date"
                  placeholder="Enter Ex-Factory Date"
                  value={exFactoryDate}
                  onChange={(e) => setExFactoryDate(e.target.value)}
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
      </div>

      {initialData?.items?.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Purchase Order Items
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Commercial, packaging, and measurement details for this shipment
                item.
              </p>
            </div>

            <DataTable
              columns={purchaseOrderUploadColumns}
              data={initialData?.items}
            />
          </div>
        </div>
      )}

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
                <Label className="text-xs font-medium text-foreground">
                  Instructions
                </Label>
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
    </div>
  )
}
