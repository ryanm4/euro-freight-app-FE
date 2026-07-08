"use client"

import FormDateField from "@/components/shared/FormDateField"
import FormField from "@/components/shared/FormField"
import FormFileInput from "@/components/shared/FormFileInput"
import FormTextarea from "@/components/shared/FormTextarea"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchPurchaseOrderById } from "@/lib/api/purchase-orders"
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
              <FormField
                label="PO Number"
                id="po-number"
                placeholder="Enter PO Number"
                value={data.po_number}
                className="col-span-1"
                readOnly={true}
              />
              <FormField
                label="PO Quantity"
                id="po-quantity"
                placeholder="Enter PO Quantity"
                value={data.po_quantity}
                readOnly={true}
              />
            </div>

            {/* Row 2: Supplier + Freight Forwarder */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Supplier"
                id="supplier"
                placeholder="Enter Supplier"
                value={data.supplier_id}
                readOnly={true}
              />
              <FormField
                label="Freight Forwarder"
                id="freight-forwarder"
                placeholder="Enter Freight Forwarder"
                value={data.freight_forwarder}
                readOnly={true}
              />
            </div>

            {/* Row 3: Payment Mode + Shipping Mode */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Payment Mode"
                id="payment-mode"
                placeholder="Enter Payment Mode"
                value={data.payment_mode}
                readOnly={true}
              />
              <FormField
                label="Shipping Mode"
                id="shipping-mode"
                placeholder="Enter Shipping Mode"
                value={data.shipping_mode}
                readOnly={true}
              />
            </div>

            {/* Row 4: Final Destination */}
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Final Destination"
                id="final-destination"
                placeholder="Enter Final Destination"
                value={data.final_destination}
                readOnly={true}
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
                value={data.ex_factory_date}
                readOnly={true}
              />
              <FormFileInput label="PO Document" id="po-document" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormTextarea
                label="Instructions"
                value={data.instructions}
                placeholder="Type your message here."
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
