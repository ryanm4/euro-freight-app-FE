"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
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
import { fetchPurchaseOrderById } from "@/lib/api/purchase-orders"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { purchaseOrderDetailColumns } from "../_components/purchase-order-detail-columns"
import { DataTable } from "../_components/purchase-order-table"

const STATUS_OPTIONS = ["Draft", "Saved", "Completed"]

export default function PurchaseOrderByID() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["purchase-order", id],
    queryFn: () => fetchPurchaseOrderById(id),
  })

  const formatDate = (date?: string | null) =>
    date ? format(new Date(date), "dd/MMM/yy HH:mm") : "N/A"

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

      <div className="mx-auto space-y-5">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => router.push("/purchase-order")}
          >
            Back
          </Button>
          <Button
            className="rounded-md"
            onClick={() => router.push(`/purchase-order/${id}/edit`)}
          >
            Edit
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
                    value={data.poNumber ?? "-"}
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
                    value={data.totalQty ?? "0"}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    disabled
                  />
                </div>
              </div>

              {/* Row 2: Supplier + Final Destination */}
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
                    value={data.vendor ?? ""}
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
                    value={data.shipTo ?? ""}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    disabled
                  />
                </div>
              </div>

              {/* Row 3: Ex-Factory Date + Status */}
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
                    value={formatDate(data.ex_factory_date)}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    disabled
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-medium text-foreground">
                    Status
                  </Label>
                  <Select value={data.status ?? "Draft"} disabled>
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

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-5">
            <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Purchase Order Items
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Commercial, packaging, and measurement details for this
                  shipment item.
                </p>
              </div>

              <DataTable columns={purchaseOrderDetailColumns} data={items} />
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
                    value={data.instructions ?? ""}
                    disabled
                    className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}