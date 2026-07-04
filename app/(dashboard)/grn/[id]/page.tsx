"use client"

import FormDateField from "@/components/shared/FormDateField"
import FormField from "@/components/shared/FormField"
import FormTextarea from "@/components/shared/FormTextarea"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchGoodsReceiveNoteById } from "@/lib/api/goods_receive_notes"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

interface PackingListRow {
  id: number
  packingListNo: string
  client: string
  manufacturer: string
  date: string
  quantity: number
  gdnNo: string
  status: string
}

interface GrnData {
  date: string
  client: string
  forwarder: string
  manufacturer: string
  quantity: string
  remarks: string
  packingLists: PackingListRow[]
}

const createGRNObject = (grn: any): GrnData => {
  return {
    date: grn.date ?? "—",
    client: grn.client_id ?? "—",
    forwarder: grn.forwarder_id ?? "—",
    manufacturer: grn.manufacture_id ?? "—",
    quantity: grn.quantity ?? "—",
    remarks: grn.remarks ?? "—",
    packingLists:
      grn.packing_lists?.map((pl: any) => ({
        id: pl.id,
        packingListNo: `PL-${pl.id}`,
        client: pl.client_id,
        manufacturer: pl.grn_id ? `GRN-${pl.grn_id}` : "—",
        date: pl.date
          ? new Date(pl.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
        quantity: pl.quantity,
        gdnNo: pl.gdn_id ? `GDN-${pl.gdn_id}` : "—",
        status: pl.purchase_orders?.[0]?.status ?? "—",
      })) ?? [],
  }
}

export default function GrnByID() {
  const { id } = useParams<{ id: string }>()
  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["grn", id],
    queryFn: () => fetchGoodsReceiveNoteById(id),
  })

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data

  const grn = createGRNObject(data)

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`GRN-${id}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "GRN", href: "/grn" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" disabled>
          Edit
        </Button>
      </div>

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
              <FormDateField
                label="Date"
                id={`date`}
                value={grn.date}
                readOnly={true}
              />
              <FormField
                label="Client"
                value={grn.client}
                readOnly={true}
                id="client"
              />
              <FormField
                label="Forwarder"
                value={grn.forwarder}
                readOnly={true}
                id="forwarder"
              />
              <FormField
                label="Manufacturer"
                value={grn.manufacturer}
                readOnly={true}
                id="manufacturer"
              />
            </div>

            {/* Row 2: Quantity, Packing List */}
            <div className="grid grid-cols-4 gap-4">
              <FormField
                label="Quantity"
                id="quantity"
                placeholder="Enter Quantity"
                value={grn.quantity}
                readOnly={true}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Available Packing Lists
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Select from the available packing lists to associate with this
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Packing List No
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Client
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Manufacturer
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Quantity
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      GDN No
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grn.packingLists.length ? (
                    grn.packingLists.map((row, index) => (
                      <TableRow
                        key={index}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-100">
                          {row.packingListNo}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.client}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.manufacturer}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.quantity}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.gdnNo}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                            {row.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-24 text-center text-sm text-zinc-500"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
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
                  value={grn.remarks}
                  placeholder="Type your message here."
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
