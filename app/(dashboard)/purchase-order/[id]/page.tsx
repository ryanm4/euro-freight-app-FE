"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchPurchaseOrderById } from "@/lib/api/purchase-orders"
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams } from "next/navigation"
import { useState } from "react"
import { CargoItem } from "../_components/purchase-order-form"

export default function PurchaseOrderByID() {
  const { id } = useParams<{ id: string }>()
  const [openItemIds, setOpenItemIds] = useState<Set<number>>(new Set())

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

  const toggleItem = (itemId: number) => {
    setOpenItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data
  const items = data.items ?? []

  return (
    <div className="mx-6 mb-6 space-y-6">
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
                <Label
                  htmlFor="po-number"
                  className="text-xs font-medium text-foreground"
                >
                  PO Number
                </Label>
                <Input
                  id="po-number"
                  placeholder="Enter PO Number"
                  value={data.po_number}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="po-quantity"
                  className="text-xs font-medium text-foreground"
                >
                  PO Quantity
                </Label>
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
                <Label
                  htmlFor="supplier"
                  className="text-xs font-medium text-foreground"
                >
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  placeholder="Enter Supplier"
                  value={data.supplier_id}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="freight-forwarder"
                  className="text-xs font-medium text-foreground"
                >
                  Freight Forwarder
                </Label>
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
                <Label
                  htmlFor="payment-mode"
                  className="text-xs font-medium text-foreground"
                >
                  Payment Mode
                </Label>
                <Input
                  id="payment-mode"
                  placeholder="Enter Payment Mode"
                  value={data.payment_mode}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                <Label
                  htmlFor="ex-factory-date"
                  className="text-xs font-medium text-foreground"
                >
                  Ex Factory Date
                </Label>
                <Input
                  id="ex-factory-date"
                  placeholder="Enter Ex Factory Date"
                  value={formatDateValue(data.ex_factory_date)}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="po-document"
                  className="text-xs font-medium text-foreground"
                >
                  PO Document
                </Label>
                <Input
                  id="po-document"
                  type="file"
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Order Items */}
      <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
        <div className="mb-5">
          <h2 className="text-sm font-semibold text-zinc-100">
            Purchase Order Items
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Commercial, packaging, and measurement details for this shipment
            item.
          </p>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No items found.</p>
        ) : (
          <div className="space-y-3">
            {items.map((item: CargoItem, index: number) => {
              const isOpen = openItemIds.has(item.id as number)
              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={() => toggleItem(item.id as number)}
                >
                  <div className="overflow-hidden rounded-lg border border-zinc-800">
                    {/* Accordion Header */}
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-zinc-800/50">
                        <span className="text-sm font-medium text-zinc-300">
                          {item.item_name
                            ? `${item.item_name}${item.sku ? ` (${item.sku})` : ""}`
                            : `Purchase Order Item ${index + 1}`}
                        </span>
                        {isOpen ? (
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
                            <Label
                              htmlFor={`sku-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              SKU
                            </Label>
                            <Input
                              id={`sku-${item.id}`}
                              value={item.sku ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`item-name-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Item Name
                            </Label>
                            <Input
                              id={`item-name-${item.id}`}
                              value={item.item_name ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`color-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Color
                            </Label>
                            <Input
                              id={`color-${item.id}`}
                              value={item.color ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`size-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Size
                            </Label>
                            <Input
                              id={`size-${item.id}`}
                              value={item.size ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                        </div>

                        {/* Row 2: Country of Origin, Unit Cost, Quantity, Dispatched Qty */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`coo-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Country of Origin
                            </Label>
                            <Input
                              id={`coo-${item.id}`}
                              value={item.country_of_origin ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`unit-cost-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Unit Cost
                            </Label>
                            <Input
                              id={`unit-cost-${item.id}`}
                              value={item.unit_cost ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`quantity-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Quantity
                            </Label>
                            <Input
                              id={`quantity-${item.id}`}
                              value={item.quantity ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`dispatched-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Dispatched Quantity
                            </Label>
                            <Input
                              id={`dispatched-${item.id}`}
                              value={item.dispatched_quantity ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                        </div>

                        {/* Row 3: Cartons, Gross Weight, Net Weight, CTN Dimensions */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`cartons-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Cartons
                            </Label>
                            <Input
                              id={`cartons-${item.id}`}
                              value={item.cartoons ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`gross-weight-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Gross Weight
                            </Label>
                            <Input
                              id={`gross-weight-${item.id}`}
                              value={item.gross_weight ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`net-weight-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              Net Weight
                            </Label>
                            <Input
                              id={`net-weight-${item.id}`}
                              value={item.net_weight ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`ctn-dims-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              CTN Dimensions
                            </Label>
                            <Input
                              id={`ctn-dims-${item.id}`}
                              value={item.ctn_demi ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                        </div>

                        {/* Row 4: CBM, Status */}
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                          <div className="flex flex-col gap-1.5">
                            <Label
                              htmlFor={`cbm-${item.id}`}
                              className="text-xs font-medium text-foreground"
                            >
                              CBM
                            </Label>
                            <Input
                              id={`cbm-${item.id}`}
                              value={item.cbm ?? ""}
                              disabled
                              className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600"
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        )}
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
                <Label className="text-xs font-medium text-foreground">
                  Instructions
                </Label>
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