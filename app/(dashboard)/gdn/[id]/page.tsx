"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { fetchGoodsDispatchNoteById } from "@/lib/api/goods_dispatch_notes"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams } from "next/navigation"

const createGDNObject = (gdn: any) => {
  return {
    gdnNo: gdn.gdn_no ?? "—",
    date: gdn.date ?? "—",
    gdnReference: gdn.gdn_grn_ref ?? "—",
    vehicleNo: gdn.vehicle_no ?? "—",
    status: gdn.status ?? "—",
    client: gdn.client_name ?? "—",
    manufacturer: gdn.manufacture_name ?? "—",
    forwarder: gdn.forwarder_name ?? "—",
    driver: gdn.driver_name ?? "—",
    driverNic: gdn.driver_nic_no ?? "—",
    driverContactNo: gdn.driver_contact_no ?? "—",
    wharfStaff: gdn.wharf_staff_name ?? "—",
    wharfStaffContactNo: gdn.wharf_staff_contact_no ?? "—",
    dispatchLocation: gdn.dispatch_location ?? "—",
    transportMode: gdn.transport_mode ?? "—",
    containerNo: gdn.container_no ?? "—",
    containerSize: gdn.container_size ?? "—",
    primarySealNo: gdn.primary_seal_no ?? "—",
    secondarySealNo: gdn.secondary_seal_no ?? "—",
    customDocStatus: gdn.custom_doc_status ?? "—",
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
        packingListNo: pl.packing_list_no ?? `PL-${pl.id}`,
        clientName: pl.client_name ?? gdn.client_name ?? "—",
        forwarderName: pl.forwarder_name ?? gdn.forwarder_name ?? "—",
        shippingMode: pl.shipping_mode ?? "—",
        poNumber: pl.po_number ?? "—",
        date: pl.date
          ? (() => {
              try {
                const parsable = pl.date.includes(" ")
                  ? pl.date.replace(" ", "T")
                  : pl.date
                return format(new Date(parsable), "PPP")
              } catch {
                return pl.date
              }
            })()
          : "—",
        totalCartons: pl.total_cartons ?? "—",
        totalQuantity: pl.total_quantity ?? "—",
        totalCbm: pl.total_cbm ?? "—",
        totalNetWeightKg: pl.total_net_weight_kg ?? "—",
        totalGrossWeightKg: pl.total_gross_weight_kg ?? "—",
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

  const gdn = createGDNObject(data)

  return (
    <div className="mx-6 mb-5 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`GDN ${data?.gdn_no ?? ""}`}
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
              Core shipment reference information.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="date"
                  className="text-xs font-medium text-foreground"
                >
                  Date
                </Label>
                <Input
                  id="date"
                  placeholder="Enter Date"
                  value={formatDateValue(gdn.date)}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gdn-reference"
                  className="text-xs font-medium text-foreground"
                >
                  GDN/GRN Reference
                </Label>
                <Input
                  id="gdn-reference"
                  placeholder="Enter GDN/GRN Reference"
                  value={gdn.gdnReference}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="manufacturer"
                  className="text-xs font-medium text-foreground"
                >
                  Manufacturer
                </Label>
                <Input
                  id="manufacturer"
                  placeholder="Enter Manufacturer"
                  value={gdn.manufacturer}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="status"
                  className="text-xs font-medium text-foreground"
                >
                  Status
                </Label>
                <Input
                  id="status"
                  placeholder="Enter Status"
                  value={gdn.status}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
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
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="client"
                  className="text-xs font-medium text-foreground"
                >
                  Customer (Client)
                </Label>
                <Input
                  id="client"
                  placeholder="Enter Client"
                  value={gdn.client}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="forwarder"
                  className="text-xs font-medium text-foreground"
                >
                  Forwarder
                </Label>
                <Input
                  id="forwarder"
                  placeholder="Enter Forwarder"
                  value={gdn.forwarder}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Dispatch Location & Transport
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Where the shipment was dispatched from and how it moved.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="dispatch-location"
                  className="text-xs font-medium text-foreground"
                >
                  Dispatch Location
                </Label>
                <Input
                  id="dispatch-location"
                  placeholder="Enter Dispatch Location"
                  value={gdn.dispatchLocation}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="transport-mode"
                  className="text-xs font-medium text-foreground"
                >
                  Cargo Transport Mode
                </Label>
                <Input
                  id="transport-mode"
                  placeholder="Enter Transport Mode"
                  value={gdn.transportMode}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            {gdn.transportMode === "FCL container" && (
              <div className="space-y-4 rounded-md border border-neutral-800 bg-neutral-950/40 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="container-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Container Number
                    </Label>
                    <Input
                      id="container-no"
                      placeholder="Enter Container Number"
                      value={gdn.containerNo}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="container-size"
                      className="text-xs font-medium text-foreground"
                    >
                      Container Size
                    </Label>
                    <Input
                      id="container-size"
                      placeholder="Enter Container Size"
                      value={gdn.containerSize}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="primary-seal-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Primary Seal Number
                    </Label>
                    <Input
                      id="primary-seal-no"
                      placeholder="Enter Primary Seal Number"
                      value={gdn.primarySealNo}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="secondary-seal-no"
                      className="text-xs font-medium text-foreground"
                    >
                      Secondary (Final) Seal Number
                    </Label>
                    <Input
                      id="secondary-seal-no"
                      placeholder="Enter Secondary Seal Number"
                      value={gdn.secondarySealNo}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Vehicle & Personnel
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Driver and wharf staff details extracted from their existing
              profiles.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="vehicle-no"
                className="text-xs font-medium text-foreground"
              >
                Vehicle No
              </Label>
              <Input
                id="vehicle-no"
                placeholder="Enter Vehicle No"
                value={gdn.vehicleNo}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="driver"
                className="text-xs font-medium text-foreground"
              >
                Driver
              </Label>
              <Input
                id="driver"
                placeholder="Enter Driver"
                value={gdn.driver}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="driver-nic"
                  className="text-xs font-medium text-foreground"
                >
                  Driver NIC
                </Label>
                <Input
                  id="driver-nic"
                  placeholder="Enter Driver NIC"
                  value={gdn.driverNic}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="driver-contact-no"
                  className="text-xs font-medium text-foreground"
                >
                  Driver Contact No
                </Label>
                <Input
                  id="driver-contact-no"
                  placeholder="Enter Driver Contact No"
                  value={gdn.driverContactNo}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="wharf-staff"
                className="text-xs font-medium text-foreground"
              >
                Wharf Staff
              </Label>
              <Input
                id="wharf-staff"
                placeholder="Enter Wharf Staff"
                value={gdn.wharfStaff}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="wharf-staff-contact-no"
                className="text-xs font-medium text-foreground"
              >
                Wharf Staff Contact No
              </Label>
              <Input
                id="wharf-staff-contact-no"
                placeholder="Enter Wharf Staff Contact No"
                value={gdn.wharfStaffContactNo}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
              Planned cartons and the actual physical count loaded.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="cartons"
                  className="text-xs font-medium text-foreground"
                >
                  Cartons (Planned)
                </Label>
                <Input
                  id="cartons"
                  placeholder="Enter Cartons"
                  value={gdn.cartons}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="actual-cartons"
                  className="text-xs font-medium text-foreground"
                >
                  Total Quantity (Actual Loaded)
                </Label>
                <Input
                  id="actual-cartons"
                  placeholder="Enter Actual Cartons Loaded"
                  value={gdn.actualCartons}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="custom-doc-status"
                className="text-xs font-medium text-foreground"
              >
                Customs Document Status
              </Label>
              <Input
                id="custom-doc-status"
                placeholder="Enter Customs Document Status"
                value={gdn.customDocStatus}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gross-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Gross Weight
                </Label>
                <Input
                  id="gross-weight"
                  placeholder="Enter Gross Weight"
                  value={gdn.grossWeight}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="actual-gross-weight"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Gross Weight
                </Label>
                <Input
                  id="actual-gross-weight"
                  placeholder="Enter Actual Gross Weight"
                  value={gdn.actualGrossWeight}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="gross-volume"
                  className="text-xs font-medium text-foreground"
                >
                  Gross Volume
                </Label>
                <Input
                  id="gross-volume"
                  placeholder="Enter Gross Volume"
                  value={gdn.grossVolume}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="actual-gross-volume"
                  className="text-xs font-medium text-foreground"
                >
                  Actual Gross Volume
                </Label>
                <Input
                  id="actual-gross-volume"
                  placeholder="Enter Actual Gross Volume"
                  value={gdn.actualGrossVolume}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-1">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Associated Packing Lists
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Packing lists linked to this dispatch note.
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
                      Forwarder
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Shipping Mode
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Cartons
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Quantity
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      CBM
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Net Weight (kg)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Gross Weight (kg)
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
                          {row.clientName}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.forwarderName}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.shippingMode}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalCartons}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalQuantity}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalCbm}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalNetWeightKg}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalGrossWeightKg}
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
                        colSpan={10}
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
              Any other notes relevant to this dispatch.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Remarks
                </Label>
                <Textarea
                  placeholder="Type your message here."
                  value={gdn.remarks}
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