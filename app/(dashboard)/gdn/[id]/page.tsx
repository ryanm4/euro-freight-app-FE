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
import { fetchGoodsDispatchNoteById } from "@/lib/api/goods_dispatch_notes"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

const createGDNObject = (gdn: any) => {
  return {
    date: gdn.date ?? "—",
    gdnReference: gdn.gdn_grn_ref ?? "—",
    vehicleNo: gdn.vehicle_no ?? "—",
    client: gdn.client_id ?? "—",
    manufacturer: gdn.manufacture_id ?? "—",
    forwarder: gdn.forwarder_id ?? "—",
    cartons: gdn.cartoons ?? "—",
    actualCartons: gdn.actual_cartoons ?? "—",
    grossWeight: gdn.gross_weight ?? "—",
    actualGrossWeight: gdn.actual_gross_weight ?? "—",
    grossVolume: gdn.gross_volume ?? "—",
    actualGrossVolume: gdn.actual_gross_volume ?? "—",
    remarks: gdn.remarks ?? "—",
    packingLists:
      gdn.packing_lists?.map((pl: any) => ({
        id: pl.id,
        packingListNo: `PL-${pl.id}`,
        client: pl.client_id,
        manufacturer: pl.manufacture_id,
        date: pl.date,
        quantity: pl.quantity,
        gdnNo: pl.gdn_id ? `GDN-${pl.gdn_id}` : "—",
        status: pl.status ?? "—",
      })) ?? [],
  }
}

export default function GdnByID() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["gdn", id],
    queryFn: () => fetchGoodsDispatchNoteById(id),
  })

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data

  console.log("data", data)

  const gdn = createGDNObject(data)
  console.log("gdn", gdn)

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`GDN-${id}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "GDN", href: "/gdn" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" disabled>
          Edit
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Core shipment and transport information.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormDateField
                label="Date"
                id={`date`}
                value={gdn.date}
                readOnly={true}
              />

              <FormField
                label="GDN/GRN Reference"
                id="gdn-reference"
                placeholder="Enter GDN/GRN Reference"
                value={gdn.gdnReference}
                readOnly={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Vehicle No"
                id="vehicle-no"
                placeholder="Enter Vehicle No"
                value={gdn.vehicleNo}
                readOnly={true}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Business Partners
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Organizations involved in the shipment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Client"
                id="client"
                placeholder="Enter Client"
                value={gdn.client}
                readOnly={true}
              />
              <FormField
                label="Manufacturer"
                id="manufacturer"
                placeholder="Enter Manufacturer"
                value={gdn.manufacturer}
                readOnly={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Forwarder"
                id="forwarder"
                placeholder="Enter Forwarder"
                value={gdn.forwarder}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Packing Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Packing lists and carton quantities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Cartons"
                id="cartons"
                placeholder="Enter Cartons"
                value={gdn.cartons}
                readOnly={true}
              />

              <FormField
                label="Actual Cartons"
                id="actual-cartons"
                placeholder="Enter Actual Cartons"
                value={gdn.actualCartons}
                readOnly={true}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Measurements
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Planned versus actual shipment measurements.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Gross Weight"
                id="gross-weight"
                placeholder="Enter Gross Weight"
                value={gdn.grossWeight}
                readOnly={true}
              />

              <FormField
                label="Actual Gross Weight"
                id="actual-gross-weight"
                placeholder="Enter Actual Gross Weight"
                value={gdn.actualGrossWeight}
                readOnly={true}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Gross Volume"
                id="gross-volume"
                placeholder="Enter Gross Volume"
                value={gdn.grossVolume}
                readOnly={true}
              />

              <FormField
                label="Actual Gross Volume"
                id="actual-gross-volume"
                placeholder="Enter Actual Gross Volume"
                value={gdn.actualGrossVolume}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Available Packing Lists
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Select from the available packing lists to associate with this
              dispatch.
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
                      PO Number
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
                  {gdn.packingLists.length ? (
                    gdn.packingLists.map((row: any) => (
                      <TableRow
                        key={row.id}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-100">
                          {row.packingListNo}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.client}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.poNumber}
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
                value={gdn.remarks}
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
