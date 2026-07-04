"use client"

import FormField from "@/components/shared/FormField"
import FormSelect from "@/components/shared/FormSelect"
import FormTextarea from "@/components/shared/FormTextarea"
import { useState } from "react"

export default function GoodsDispatchNoteForm() {
  const [date, setDate] = useState("")
  const [gdnReference, setGdnReference] = useState("")
  const [vehicleNo, setVehicleNo] = useState("")
  const [client, setClient] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [forwarder, setForwarder] = useState("")
  const [packingList, setPackingList] = useState("")
  const [cartons, setCartons] = useState("")
  const [actualCartons, setActualCartons] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [actualGrossWeight, setActualGrossWeight] = useState("")
  const [grossVolume, setGrossVolume] = useState("")
  const [actualGrossVolume, setActualGrossVolume] = useState("")
  const [remarks, setRemarks] = useState("")

  return (
    <div className="mx-auto space-y-5">
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
              <FormSelect
                label="Date"
                value={date}
                onValueChange={setDate}
                placeholder="Date"
                options={[
                  { value: "jan", label: "January 2025" },
                  { value: "feb", label: "February 2025" },
                  { value: "mar", label: "March 2025" },
                ]}
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
                options={[
                  { value: "c1", label: "Client 1" },
                  { value: "c2", label: "Client 2" },
                  { value: "c3", label: "Client 3" },
                  { value: "c4", label: "Client 4" },
                ]}
              />
              <FormSelect
                label="Manufacturer"
                value={manufacturer}
                onValueChange={setManufacturer}
                placeholder="Choose Manufacturer"
                options={[
                  { value: "m1", label: "Manufacturer 1" },
                  { value: "m2", label: "Manufacturer 2" },
                  { value: "m3", label: "Manufacturer 3" },
                  { value: "m4", label: "Manufacturer 4" },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormSelect
                label="Forwarder"
                value={forwarder}
                onValueChange={setForwarder}
                placeholder="Choose Forwarder"
                options={[
                  { value: "f1", label: "Forwarder 1" },
                  { value: "f2", label: "Forwarder 2" },
                  { value: "f3", label: "Forwarder 3" },
                  { value: "f4", label: "Forwarder 4" },
                ]}
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
              <FormSelect
                label="Packing List"
                value={packingList}
                onValueChange={setPackingList}
                placeholder="Choose Packing List"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
              />

              <FormField
                label="Cartons"
                id="cartons"
                placeholder="Enter Cartons"
                value={cartons}
                onChange={setCartons}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
