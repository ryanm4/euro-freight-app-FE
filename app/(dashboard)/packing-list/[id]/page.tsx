"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchPackingListById } from "@/lib/api/packing_lists"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { IconPencil, IconArrowLeft } from "@tabler/icons-react"

const ITEMS_PER_PAGE = 10

export default function PackingListViewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["packing-list", id],
    queryFn: () => fetchPackingListById(id),
  })

  const formatDateValue = (val?: string | null) => {
    if (!val) return "—"
    try {
      const parsable = val.includes(" ") ? val.replace(" ", "T") : val
      return format(new Date(parsable), "PPP")
    } catch {
      return val
    }
  }

  if (isLoading) {
    return (
      <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !res?.data) {
    return (
      <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
        <p className="text-sm text-destructive">Packing list not found.</p>
      </div>
    )
  }

  const d = res.data
  const items: any[] = Array.isArray(d.items) ? d.items : []

  // Pagination
  const totalPages = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE))
  const paginatedItems = items.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Totals row
  const totalQty = items.reduce((s: number, i: any) => s + Number(i.quantity ?? 0), 0)
  const totalCartons = items.reduce((s: number, i: any) => s + Number(i.ctnCount ?? i.ctn_count ?? i.ctn ?? 0), 0)
  const totalGrossWeight = items.reduce((s: number, i: any) => s + Number(i.grossWeightKg ?? i.gross_weight_kg ?? 0), 0)
  const totalNetWeight = items.reduce((s: number, i: any) => s + Number(i.netWeightKg ?? i.net_weight_kg ?? 0), 0)
  const totalCbm = items.reduce((s: number, i: any) => s + Number(i.cbm ?? 0), 0)

  const inputCls =
    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 disabled:opacity-100 disabled:cursor-default"
  const labelCls = "text-xs font-medium text-foreground"

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title={d.packing_list_no ?? `PL-${id}`}
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Packing Lists", href: "/packing-list" },
        ]}
      />

      {/* Action Bar */}
      <div className="flex w-full items-center justify-end gap-3">
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/packing-list")}
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          size="lg"
          onClick={() => router.push(`/packing-list/${id}/edit`)}
        >
          <IconPencil className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Packing List Details */}
        <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-col gap-[0.5px]">
            <h3 className="text-md mb-2 font-medium">Packing List Details</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Important dates, documents, and shipment instructions.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-client-name" className={labelCls}>Client Name</Label>
              <Input
                id="view-client-name"
                value={d.client_name ?? (d.client_id ? String(d.client_id) : "—")}
                disabled
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-manufacturer-name" className={labelCls}>Manufacturer Name</Label>
              <Input
                id="view-manufacturer-name"
                value={d.manufacturer_name ?? (d.manufacturer_id ? String(d.manufacturer_id) : "—")}
                disabled
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-date" className={labelCls}>Date</Label>
              <Input
                id="view-date"
                value={formatDateValue(d.date)}
                disabled
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-doc-date" className={labelCls}>Document Date</Label>
              <Input
                id="view-doc-date"
                value={formatDateValue(d.document_date)}
                disabled
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-ship-to" className={labelCls}>Ship To</Label>
              <Input
                id="view-ship-to"
                value={d.ship_to ?? "—"}
                disabled
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-shipping-mode" className={labelCls}>Shipping Mode</Label>
              <Input
                id="view-shipping-mode"
                value={d.shipping_mode ?? "—"}
                disabled
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-total-volume" className={labelCls}>Total Volume</Label>
              <Input
                id="view-total-volume"
                value={d.total_volume ?? "—"}
                disabled
                className={inputCls}
              />
            </div>
          </CardContent>
        </Card>

        {/* Totals */}
        <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-col gap-[0.5px]">
            <h3 className="text-md mb-2 font-medium">Totals</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Aggregated quantities across all line items.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-total-qty" className={labelCls}>Total Quantity</Label>
              <Input id="view-total-qty" value={totalQty} disabled className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-total-cartons" className={labelCls}>Total Cartons</Label>
              <Input id="view-total-cartons" value={totalCartons} disabled className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-total-gross" className={labelCls}>Total Gross Weight (kg)</Label>
              <Input id="view-total-gross" value={totalGrossWeight.toFixed(3)} disabled className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-total-net" className={labelCls}>Total Net Weight (kg)</Label>
              <Input id="view-total-net" value={totalNetWeight.toFixed(3)} disabled className={inputCls} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="view-total-cbm" className={labelCls}>Total CBM</Label>
              <Input id="view-total-cbm" value={totalCbm.toFixed(3)} disabled className={inputCls} />
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex flex-col gap-[0.5px]">
              <h3 className="text-md font-medium">Line Items</h3>
              <p className="text-xs text-muted-foreground">
                {items.length} item{items.length !== 1 ? "s" : ""} on this packing list
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">PO Number</TableHead>
                    <TableHead className="min-w-[80px]">SKU</TableHead>
                    <TableHead className="min-w-[160px]">Item Description</TableHead>
                    <TableHead className="min-w-[70px]">Size</TableHead>
                    <TableHead className="min-w-[80px]">Quantity</TableHead>
                    <TableHead className="min-w-[100px]">Carton Count</TableHead>
                    <TableHead className="min-w-[130px]">Gross Weight (kg)</TableHead>
                    <TableHead className="min-w-[120px]">Net Weight (kg)</TableHead>
                    <TableHead className="min-w-[150px]">Carton Dimensions</TableHead>
                    <TableHead className="min-w-[70px]">CBM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.length > 0 ? (
                    <>
                      {paginatedItems.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {item.poNumber ?? item.po_number ?? "—"}
                          </TableCell>
                          <TableCell>{item.sku ?? "—"}</TableCell>
                          <TableCell>
                            {item.item_name ?? "—"}
                          </TableCell>
                          <TableCell>{item.size ?? "—"}</TableCell>
                          <TableCell>{item.quantity ?? 0}</TableCell>
                          <TableCell>
                            {item.ctnCount ?? item.ctn_count ?? item.ctn ?? 0}
                          </TableCell>
                          <TableCell>
                            {item.grossWeightKg ?? item.gross_weight_kg ?? 0}
                          </TableCell>
                          <TableCell>
                            {item.netWeightKg ?? item.net_weight_kg ?? 0}
                          </TableCell>
                          <TableCell>
                            {item.ctnDemi ?? "—"}
                          </TableCell>
                          <TableCell>{item.cbm ?? 0}</TableCell>
                        </TableRow>
                      ))}
                      {/* Totals row — only on last page */}
                      {currentPage === totalPages && (
                        <TableRow className="border-t-2 font-semibold">
                          <TableCell colSpan={4} className="text-right text-xs text-muted-foreground">
                            Totals
                          </TableCell>
                          <TableCell>{totalQty}</TableCell>
                          <TableCell>{totalCartons}</TableCell>
                          <TableCell>{totalGrossWeight.toFixed(2)}</TableCell>
                          <TableCell>{totalNetWeight.toFixed(2)}</TableCell>
                          <TableCell />
                          <TableCell>{totalCbm.toFixed(3)}</TableCell>
                        </TableRow>
                      )}
                    </>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No items on this packing list.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between py-2">
                <div className="text-xs text-muted-foreground">
                  Showing{" "}
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}{" "}
                  to{" "}
                  {Math.min(currentPage * ITEMS_PER_PAGE, items.length)}{" "}
                  of {items.length} items
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      {currentPage > 1 ? (
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className="cursor-pointer"
                        />
                      ) : (
                        <PaginationPrevious className="pointer-events-none opacity-50" />
                      )}
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      }
                      if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )
                      }
                      return null
                    })}
                    <PaginationItem>
                      {currentPage < totalPages ? (
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className="cursor-pointer"
                        />
                      ) : (
                        <PaginationNext className="pointer-events-none opacity-50" />
                      )}
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
