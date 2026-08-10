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
import { useParams, useRouter } from "next/navigation"

const DISPATCH_LOCATION_OPTIONS = [
  { label: "Airport – Katunayaka (Air)", value: "Katunayaka Airport" },
  { label: "Sea Port – Colombo Port (FCL)", value: "Colombo Port" },
  {
    label: "Consolidator's Warehouse – ACE Yard (LCL)",
    value: "ACE Yard",
  },
]

const formatDateValue = (val?: string) => {
  if (!val) return "—"
  try {
    const parsable = val.includes(" ") ? val.replace(" ", "T") : val
    return format(new Date(parsable), "PPP")
  } catch {
    return val
  }
}

// Computes CBM (m³) for a single measurement row, honoring its UOM.
const getMeasurementCbm = (m: {
  length_cm?: number
  width_cm?: number
  height_cm?: number
  uom?: string
}) => {
  const l = Number(m.length_cm) || 0
  const w = Number(m.width_cm) || 0
  const h = Number(m.height_cm) || 0

  if (m.uom === "m") {
    return l * w * h
  }
  return (l * w * h) / 1_000_000
}

const createGDNObject = (gdn: any) => {
  const packingLists =
    gdn.packing_lists?.map((pl: any) => ({
      id: pl.id,
      packingListNo: pl.packing_list_no ?? `PL-${pl.id}`,
      shippingMode: pl.shipping_mode ?? "—",
      date: pl.date ? formatDateValue(pl.date) : "—",
      totalCartons: pl.total_cartons ?? 0,
      totalCbm: pl.total_cbm ?? "0",
      totalNetWeightKg: pl.total_net_weight_kg ?? "0",
      totalGrossWeightKg: pl.total_gross_weight_kg ?? "0",
      totalQuantity: pl.total_quantity ?? 0,
      status: pl.status ?? "—",
    })) ?? []

  // Packing List Quantity = sum of cartons across all linked packing
  // lists, mirroring the create form's `packingListQuantity` calc.
  const packingListQuantity = packingLists.reduce(
    (acc: number, pl: any) => acc + (Number(pl.totalCartons) || 0),
    0
  )

  // Shipment Measurements — repeatable rows, mirroring the create form.
  // Falls back to an empty array if the API hasn't returned any yet.
  const measurements =
    gdn.measurements?.map((m: any, idx: number) => {
      const cbm = getMeasurementCbm(m)
      const total = m.total ?? m.quantity ?? 0
      return {
        id: m.id ?? idx,
        length: m.length_cm ?? "—",
        width: m.width_cm ?? "—",
        height: m.height_cm ?? "—",
        uom: m.uom ?? "cm",
        total,
        cbm,
        volume: cbm * Number(total || 0),
      }
    }) ?? []

  const totalCalculatedVolume = measurements.reduce(
    (sum: number, m: any) => sum + (m.volume ?? 0),
    0
  )

  const dispatchLocationLabel =
    DISPATCH_LOCATION_OPTIONS.find((opt) => opt.value === gdn.dispatch_location)
      ?.label ??
    gdn.dispatch_location ??
    "—"

  return {
    gdnNo: gdn.gdn_no ?? "—",
    date: gdn.date ?? "",
    gdnReference: gdn.gdn_grn_ref ?? "—",
    vehicleNo: gdn.vehicle_no ?? "—",
    status: gdn.status ?? "—",
    client: gdn.client_name ?? "—",
    manufacturer: gdn.manufacture_name ?? "—",
    forwarder: gdn.forwarder_name ?? "—",
    driver: gdn.driver_name ?? "—",
    // Not currently returned by the API — shows "—" until the backend adds it.
    driverNic: gdn.driver_nic_no ?? "—",
    driverContactNo: gdn.driver_contact_no ?? "—",
    // Not present in the current API response — will populate once the
    // backend starts returning a separate optional contact field.
    driverContactNoOptional: gdn.driver_contact_no_optional ?? "—",
    wharfStaff: gdn.wharf_staff_name ?? "—",
    wharfStaffContactNo: gdn.wharf_contact_no ?? "—",
    wharfStaffContactNoOptional: gdn.wharf_contact_no_optional ?? "—",
    dispatchLocation: dispatchLocationLabel,
    transportMode: gdn.transport_mode ?? "—",
    containerNo: gdn.container_no ?? "—",
    containerSize: gdn.container_size ?? "—",
    primarySealNo: gdn.primary_seal_no ?? "—",
    secondarySealNo: gdn.secondary_seal_no ?? "—",
    customDocStatus: gdn.custom_doc_status ?? "—",
    packingListQuantity,
    quantityLoaded: gdn.cartoons ?? "—",
    grossWeight: gdn.gross_weight ?? "—",
    measurements,
    totalCalculatedVolume,
    remarks: gdn.remarks ?? "—",
    packingLists,
  }
}

export default function GdnByID() {
  const router = useRouter()
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
  const gdn = createGDNObject(data)

  const onEditClick = () => {
    router.push(`/gdn/${id}/edit`)
  }

  return (
    <div className="mx-6 mb-5 space-y-5">
      <div className="mt-4">
        <PageTitleWithBreadcrumb
          title={`${data?.gdn_no ?? ""}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Goods Dispatched Notes", href: "/gdn" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" onClick={onEditClick}>
          Edit
        </Button>
      </div>

      {/* Shipment Details / Business Partners */}
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
                  value={gdn.gdnReference}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="status"
                  className="text-xs font-medium text-foreground"
                >
                  Status
                </Label>
                <Input
                  id="status"
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
              Client and Forwarder derived from the linked packing list(s).
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
                  value={gdn.forwarder}
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
                  value={gdn.manufacturer}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispatch Location & Transport / Vehicle & Personnel */}
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
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Delivered To
              </Label>
              <Input
                value={gdn.dispatchLocation}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Cargo Transport Mode
              </Label>
              <Input
                value={gdn.transportMode}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            {gdn.transportMode === "FCL container" && (
              <div className="space-y-4 rounded-md border border-neutral-800 bg-neutral-950/40 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Container Number
                    </Label>
                    <Input
                      value={gdn.containerNo}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Container Size
                    </Label>
                    <Input
                      value={gdn.containerSize}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Primary Seal Number
                    </Label>
                    <Input
                      value={gdn.primarySealNo}
                      disabled
                      className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs font-medium text-foreground">
                      Secondary (Final) Seal Number
                    </Label>
                    <Input
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
              <Label className="text-xs font-medium text-foreground">
                Vehicle No
              </Label>
              <Input
                value={gdn.vehicleNo}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Driver
              </Label>
              <Input
                value={gdn.driver}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Driver NIC
                </Label>
                <Input
                  value={gdn.driverNic}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Driver Contact No
                </Label>
                <Input
                  value={gdn.driverContactNo}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Driver Contact No (Optional)
                </Label>
                <Input
                  value={gdn.driverContactNoOptional}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Wharf Staff
              </Label>
              <Input
                value={gdn.wharfStaff}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Wharf Staff Contact No
              </Label>
              <Input
                value={gdn.wharfStaffContactNo}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Wharf Staff Contact No (Optional)
              </Label>
              <Input
                value={gdn.wharfStaffContactNoOptional}
                disabled
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Packing Information */}
      <div className="grid grid-cols-1 gap-5">
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
                <Label className="text-xs font-medium text-foreground">
                  Packing List Quantity
                </Label>
                <Input
                  value={gdn.packingListQuantity}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Quantity Loaded
                </Label>
                <Input
                  value={gdn.quantityLoaded}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Customs Document Status
                </Label>
                <Input
                  value={gdn.customDocStatus}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Gross Weight
                </Label>
                <Input
                  value={gdn.grossWeight}
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
              Shipment Measurements
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Carton dimensions recorded for this dispatch.
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Length
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Width
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Height
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      UOM
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      CBM (m³)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Volume (m³)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gdn.measurements.length ? (
                    gdn.measurements.map((m: any) => (
                      <TableRow
                        key={m.id}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-300">
                          {m.length}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.width}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.height}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.uom}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.total}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.cbm.toFixed(4)}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {m.volume.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-sm text-zinc-500"
                      >
                        No measurements recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end border-t border-neutral-800 pt-3">
              <div className="text-xs text-zinc-400">
                Total Calculated Volume:{" "}
                <span className="font-medium text-zinc-100">
                  {gdn.totalCalculatedVolume.toFixed(4)} m³
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Packing Lists */}
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
                      Date
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Shipping Mode
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Cartons
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total CBM
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Net Weight(kg)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Gross Weight(kg)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total Quantity
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
                          {row.date}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.shippingMode}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalCartons}
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
                        <TableCell className="text-sm text-zinc-300">
                          {row.totalQuantity}
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
                        colSpan={9}
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

      {/* Additional Information */}
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