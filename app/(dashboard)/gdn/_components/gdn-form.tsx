"use client"

import FormDateField from "@/components/shared/FormDateField"
import FormField from "@/components/shared/FormField"
import FormSelect from "@/components/shared/FormSelect"
import FormTextarea from "@/components/shared/FormTextarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchClients } from "@/lib/api/clients"
import { createGoodsDispatchNote } from "@/lib/api/goods_dispatch_notes"
import { fetchPackingLists } from "@/lib/api/packing_lists"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"

interface PackingListRow {
  id: number
  packingListNo: string
  client: string
  poNumber: string
  date: string
  quantity: number
  gdnNo: string
  status: string
}

export default function GoodsDispatchNoteForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [date, setDate] = useState("")
  const [gdnReference, setGdnReference] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [client, setClient] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [cartons, setCartons] = useState("")
  const [actualCartons, setActualCartons] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [actualGrossWeight, setActualGrossWeight] = useState("")
  const [grossVolume, setGrossVolume] = useState("")
  const [actualGrossVolume, setActualGrossVolume] = useState("")
  const [remarks, setRemarks] = useState("")

  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const { data } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const { data: packingLists } = useQuery({
    queryKey: ["packingLists"],
    queryFn: fetchPackingLists,
  })

  const supplierOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === "client") || []
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === "manufacturer") || []
  }, [data])

  const forwarderOptions = useMemo(() => {
    return data?.data?.filter((c: any) => c.type === "forwarder") || []
  }, [data])

  const toggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    )
  }

  const rows: PackingListRow[] = useMemo(() => {
    return (
      packingLists?.data?.map((pl: any) => ({
        id: pl.packing_list_id,
        packingListNo: `PL-${pl.packing_list_id}`,
        client: pl.client_id,
        poNumber: pl.purchase_orders?.[0]?.po_number ?? "—",
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
      })) ?? []
    )
  }, [packingLists])

  const handleSave = async () => {
    if (!client || !manufacturer || !forwarder || !date) {
      alert("Please fill in Date, Client, Manufacturer, and Forwarder.")
      return
    }
    if (selectedRows.length === 0) {
      alert("Please select at least one packing list.")
      return
    }

    try {
      setIsSaving(true)
      await createGoodsDispatchNote({
        client,
        manufacturer,
        forwarder,
        date,
        selectedRows,
        cartons,
        actualCartons,
        grossWeight,
        actualGrossWeight,
        grossVolume,
        actualGrossVolume,
        gdnReference,
        vehicleNo,
      })
      router.push("/gdn")
    } catch (err) {
      console.error(err)
      alert("Failed to save goods dispatch note.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto space-y-5">
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          className="rounded-md"
          onClick={() => router.push("/gdn")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
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
                value={date}
                onChange={setDate}
              />

              <FormField
                label="GDN/GRN Reference"
                id="gdn-reference"
                placeholder="Enter GDN/GRN Reference"
                value={gdnReference}
                onChange={setGdnReference}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Vehicle No"
                id="vehicle-no"
                placeholder="Enter Vehicle No"
                value={vehicleNo}
                onChange={setVehicleNo}
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
              <FormSelect
                label="Client"
                value={client}
                onValueChange={setClient}
                placeholder="Choose Client"
                options={supplierOptions.map((c: any) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
              <FormSelect
                label="Manufacturer"
                value={manufacturer}
                onValueChange={setManufacturer}
                placeholder="Choose Manufacturer"
                options={manufacturerOptions.map((c: any) => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Forwarder"
                value={forwarder}
                onValueChange={setForwarder}
                placeholder="Choose Forwarder"
                options={forwarderOptions.map((c: any) => ({
                  value: c.id,
                  label: c.name,
                }))}
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
                value={cartons}
                onChange={setCartons}
              />

              <FormField
                label="Actual Cartons"
                id="actual-cartons"
                placeholder="Enter Actual Cartons"
                value={actualCartons}
                onChange={setActualCartons}
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
                value={grossWeight}
                onChange={setGrossWeight}
              />

              <FormField
                label="Actual Gross Weight"
                id="actual-gross-weight"
                placeholder="Enter Actual Gross Weight"
                value={actualGrossWeight}
                onChange={setActualGrossWeight}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Gross Volume"
                id="gross-volume"
                placeholder="Enter Gross Volume"
                value={grossVolume}
                onChange={setGrossVolume}
              />

              <FormField
                label="Actual Gross Volume"
                id="actual-gross-volume"
                placeholder="Enter Actual Gross Volume"
                value={actualGrossVolume}
                onChange={setActualGrossVolume}
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
                    <TableHead className="text-xs font-medium text-zinc-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length ? (
                    rows.map((row) => (
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
                        <TableCell>
                          <Checkbox
                            checked={selectedRows.includes(row.id)}
                            onCheckedChange={() => toggleRow(row.id)}
                            className="border-neutral-600"
                          />
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
                value={remarks}
                onChange={setRemarks}
                placeholder="Type your message here."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
