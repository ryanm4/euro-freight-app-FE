"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchPurchaseOrderById } from "@/lib/api/purchase-orders"
import { format } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export default function PurchaseOrderByID() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => fetchPurchaseOrderById(id),
  })

  const formatDateValue = (val?: string) => {
    if (!val) return ""
    try {
      const parsable = val.includes(" ") ? val.replace(" ", "T") : val
      return format(new Date(parsable), "PPP")
    } catch {
      return val
    }
  }

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data
  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`Purchase Order`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Purchase Orders", href: "/purchase-order" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" disabled>
          Edit
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
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="po-number" className="text-xs font-medium text-foreground">PO Number</Label>
                <Input
                  id="po-number"
                  placeholder="Enter PO Number"
                  value={data.po_number}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="po-quantity" className="text-xs font-medium text-foreground">PO Quantity</Label>
                <Input
                  id="po-quantity"
                  placeholder="Enter PO Quantity"
                  value={data.po_quantity}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            {/* Row 2: Supplier + Freight Forwarder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="supplier" className="text-xs font-medium text-foreground">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="Enter Supplier"
                  value={data.supplier_id}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="freight-forwarder" className="text-xs font-medium text-foreground">Freight Forwarder</Label>
                <Input
                  id="freight-forwarder"
                  placeholder="Enter Freight Forwarder"
                  value={data.freight_forwarder}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            {/* Row 3: Payment Mode + Shipping Mode */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="payment-mode" className="text-xs font-medium text-foreground">Payment Mode</Label>
                <Input
                  id="payment-mode"
                  placeholder="Enter Payment Mode"
                  value={data.payment_mode}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="shipping-mode" className="text-xs font-medium text-foreground">Shipping Mode</Label>
                <Input
                  id="shipping-mode"
                  placeholder="Enter Shipping Mode"
                  value={data.shipping_mode}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            {/* Row 4: Final Destination */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="final-destination" className="text-xs font-medium text-foreground">Final Destination</Label>
                <Input
                  id="final-destination"
                  placeholder="Enter Final Destination"
                  value={data.final_destination}
                  disabled
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
                <Input
                  id="ex-factory-date"
                  placeholder="Enter Ex Factory Date"
                  value={formatDateValue(data.ex_factory_date)}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="po-document" className="text-xs font-medium text-foreground">PO Document</Label>
                <Input
                  id="po-document"
                  type="file"
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">Instructions</Label>
                <Textarea
                  placeholder="Type your message here."
                  value={data.instructions}
                  disabled
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
