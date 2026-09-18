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
import { fetchGoodsReceiveNoteById } from "@/lib/api/goods_receive_notes"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { useParams, useRouter } from "next/navigation"
import { useMemo } from "react"

interface MeasurementRow {
  id: number
  length_cm: string
  width_cm: string
  height_cm: string
  packages: number
  total: string
  uom: string
  cbm: string
  volume: string
}

interface SelectedGdn {
  id: number
  gdn_no: string
  cartoons: string
  date: string
  vehicle_no: string
  transport_mode: string
  container_no: string | null
  gross_weight: string
  gross_volume: string
  measurements: MeasurementRow[]
}

interface GrnData {
  date: string
  client: string
  forwarder: string
  manufacturer: string
  recipient: string
  recipientPhone: string
  recipientContact: string
  status: string
  quantity: number | string
  remarks: string
  gdn: SelectedGdn | null
  actualMeasurements: MeasurementRow[]
}

const createGRNObject = (grn: any): GrnData => {
  const gdnSource = grn.gdns?.[0] ?? null

  return {
    date: grn.date ?? "—",
    client: grn.client_id ?? "—",
    forwarder: grn.forwarder_id ?? "—",
    manufacturer: grn.manufacture_id ?? "—",
    recipient: grn.recipient_name ?? "—",
    recipientPhone: grn.recipient_contact_no ?? "—",
    recipientContact: grn.recipient_contact ?? "—",
    status: grn.status ?? "—",
    quantity: grn.quantity ?? "—",
    remarks: grn.comments ?? "—",
    gdn: gdnSource
      ? {
          id: gdnSource.id,
          gdn_no: gdnSource.gdn_no ?? "N/A",
          cartoons: gdnSource.cartoons ?? "N/A",
          date: gdnSource.date
            ? format(new Date(gdnSource.date), "dd/MMM/yy")
            : "N/A",
          vehicle_no: gdnSource.vehicle_no ?? "N/A",
          transport_mode: gdnSource.transport_mode ?? "N/A",
          container_no: gdnSource.container_no ?? "N/A",
          gross_weight: gdnSource.gross_weight ?? "N/A",
          gross_volume: gdnSource.gross_volume ?? "N/A",
          measurements: gdnSource.measurements ?? [],
        }
      : null,
    actualMeasurements: grn.measurements ?? [],
  }
}

export default function GrnByID() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["grn", id],
    queryFn: () => fetchGoodsReceiveNoteById(id),
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

  const grn = useMemo(() => {
    if (!res?.data) return null
    return createGRNObject(res.data)
  }, [res])

  const totalActualVolume = useMemo(() => {
    if (!grn) return 0
    return grn.actualMeasurements.reduce(
      (sum, row) => sum + (Number(row.volume) || 0),
      0
    )
  }, [grn])

  if (isLoading) return <div>Loading…</div>
  if (isError || !grn) return <>Not found</>

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
        <Button
          className="rounded-md"
          onClick={() => router.push(`/grn/${id}/edit`)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          className="rounded-md"
          onClick={() => router.push("/grn")}
        >
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Shipment Information */}
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Shipment details, associated parties, and packing lists.
            </p>
          </div>

          <div className="space-y-4">
            {/* Row 1: Date, Client, Forwarder, Manufacturer */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="date"
                  className="text-xs font-medium text-foreground"
                >
                  Date
                </Label>
                <Input
                  id="date"
                  value={formatDateValue(grn.date)}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Client
                </Label>
                <Input
                  value={grn.client}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Forwarder
                </Label>
                <Input
                  value={grn.forwarder}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Manufacturer
                </Label>
                <Input
                  value={grn.manufacturer}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Row 2: Recipient, Phone Number, Additional Phone Number, Status */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Recipient
                </Label>
                <Input
                  value={grn.recipient}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  value={grn.recipientPhone}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Additional Phone Number
                </Label>
                <Input
                  value={grn.recipientContact}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Status
                </Label>
                <Input
                  value={grn.status}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {/* Row 3: Total Pieces, Total Carton Count, Total Volume, Total Gross Weight */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Total Pieces
                </Label>
                <Input
                  value={grn.quantity}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Total Carton Count
                </Label>
                <Input
                  value={grn.gdn?.cartoons ?? "—"}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Total Volume
                </Label>
                <Input
                  value={grn.gdn?.gross_volume ?? "—"}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Total Gross Weight (Kg)
                </Label>
                <Input
                  value={grn.gdn?.gross_weight ?? "—"}
                  disabled
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Associated GDN */}
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Associated GDN
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              The GDN linked to this goods receive note.
            </p>
          </div>

          <div className="overflow-x-auto rounded-md border border-neutral-700">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-700 hover:bg-transparent">
                  <TableHead className="text-xs font-medium text-zinc-400">
                    GDN No
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Cartons
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Vehicle No
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Transport Mode
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Container No
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Gross Weight
                  </TableHead>
                  <TableHead className="text-xs font-medium text-zinc-400">
                    Gross Volume
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grn.gdn ? (
                  <TableRow className="border-neutral-800 hover:bg-neutral-800/40">
                    <TableCell className="text-sm text-zinc-100">
                      {grn.gdn.gdn_no}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.cartoons}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.date}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.vehicle_no}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.transport_mode}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.container_no ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.gross_weight}
                    </TableCell>
                    <TableCell className="text-sm text-zinc-300">
                      {grn.gdn.gross_volume}
                    </TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-24 text-center text-sm text-zinc-500"
                    >
                      No GDN associated.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* GDN Measurements */}
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              GDN Measurements
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Total quantities, volumes, and weights derived from the associated
              GDN
            </p>
          </div>

          {grn.gdn && grn.gdn.measurements.length ? (
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-700 hover:bg-transparent">
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Length (cm)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Width (cm)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Height (cm)
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Packages
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      UOM
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      CBM
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Volume
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grn.gdn.measurements.map((m) => (
                    <TableRow
                      key={m.id}
                      className="border-neutral-800 hover:bg-neutral-800/40"
                    >
                      <TableCell className="text-sm text-zinc-300">
                        {m.length_cm ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">
                        {m.width_cm ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">
                        {m.height_cm ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-100">
                        {m.packages ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">
                        {m.uom ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">
                        {m.cbm ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">
                        {m.volume ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-zinc-300">
                        {m.total ?? "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              No measurements available for this GDN.
            </p>
          )}
        </div>

        {/* Actual Measurements */}
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Actual Measurements
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Actual carton dimensions recorded on receipt.
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
                      Packages
                    </TableHead>
                    <TableHead className="text-xs font-medium text-zinc-400">
                      UOM
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
                  {grn.actualMeasurements.length ? (
                    grn.actualMeasurements.map((row) => (
                      <TableRow
                        key={row.id}
                        className="border-neutral-800 hover:bg-neutral-800/40"
                      >
                        <TableCell className="text-sm text-zinc-300">
                          {row.length_cm}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.width_cm}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.height_cm}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.packages ?? row.total}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.uom}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.cbm}
                        </TableCell>
                        <TableCell className="text-sm text-zinc-300">
                          {row.volume}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-20 text-center text-sm text-zinc-500"
                      >
                        No actual measurements recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end border-t border-neutral-800 pt-3">
              <div className="text-xs text-zinc-400">
                Total Actual Volume:{" "}
                <span className="font-medium text-zinc-100">
                  {totalActualVolume.toFixed(4)} m³
                </span>
              </div>
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
              Packing lists and carton quantities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Remarks
                </Label>
                <Textarea
                  value={grn.remarks}
                  disabled
                  className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}