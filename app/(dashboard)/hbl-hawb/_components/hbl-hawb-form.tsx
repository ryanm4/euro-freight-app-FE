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
import { useState } from "react"
import { PortMultiSelect } from "./port-multi-select"

export interface Port {
  value: string
  label: string
  country?: string
  code?: string
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FormField({
  label,
  id,
  placeholder,
  value,
  onChange,
  className = "",
}: {
  label: string
  id: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
      />
    </div>
  )
}

function FormSelect({
  label,
  value,
  onValueChange,
  placeholder,
  options,
}: {
  label: string
  value: string
  onValueChange: (v: string) => void
  placeholder: string
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-md border-neutral-700 bg-[#0A0A0A] text-neutral-100">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <Label className="text-xs font-medium text-foreground">{label}</Label>
      <Textarea
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-25 resize-none rounded-md border-neutral-700 bg-[#0A0A0A] text-sm text-neutral-100 placeholder:text-neutral-600 focus-visible:border-neutral-500 focus-visible:ring-1 focus-visible:ring-neutral-500"
      />
    </div>
  )
}

export default function HBLHABWForm() {
  const [type, setType] = useState("")
  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [mblMawbNo, setMblMawbNo] = useState("")
  const [grn, setGrn] = useState("")
  const [vesselName, setVesselName] = useState("")
  const [estimatedTimeOfDelivery, setEstimatedTimeOfDelivery] = useState("")
  const [voyageNo, setVoyageNo] = useState("")
  const [estimatedTimeOfArrival, setEstimatedTimeOfArrival] = useState("")
  const [actualTimeOfArrival, setActualTimeOfArrival] = useState("")
  const [actualTimeOfDelivery, setActualTimeOfDelivery] = useState("")
  const [arrivalPort, setArrivalPort] = useState("")
  const [inlandLocation, setInlandLocation] = useState("")
  const [noOfPieces, setNoOfPieces] = useState("")
  const [grossWeight, setGrossWeight] = useState("")
  const [chargeableWeight, setChargeableWeight] = useState("")
  const [cmb, setCmb] = useState("")
  const [containerSealNo, setContainerSealNo] = useState("")
  const [onboardedDate, setOnboardedDate] = useState("")
  const [remarks, setRemarks] = useState("")
  const [arrivalPorts, setArrivalPorts] = useState<Port[]>([])

  const availablePorts: Port[] = [
    { value: "cmb", label: "Colombo", code: "CMB", country: "Sri Lanka" },
    { value: "sin", label: "Singapore", code: "SIN", country: "Singapore" },
    { value: "dxb", label: "Dubai", code: "DXB", country: "UAE" },
    { value: "sha", label: "Shanghai", code: "SHA", country: "China" },
    { value: "klang", label: "Port Klang", code: "PKG", country: "Malaysia" },
    { value: "jfk", label: "New York JFK", code: "JFK", country: "USA" },
  ]

  return (
    <div className="mx-auto space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Shipment Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Core shipment information and transport mode
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormSelect
                label="Type"
                value={type}
                onValueChange={setType}
                placeholder="Choose Type"
                options={[
                  { value: "jan", label: "January 2025" },
                  { value: "feb", label: "February 2025" },
                  { value: "mar", label: "March 2025" },
                ]}
              />

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
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Parties & References
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Customer information and shipment references
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
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

              <FormField
                label="MBL / MAWB No"
                id="mbl-mawb-no"
                placeholder="Enter MBL / MAWB No"
                value={mblMawbNo}
                onChange={setMblMawbNo}
              />

              <FormSelect
                label="GRN"
                value={grn}
                onValueChange={setGrn}
                placeholder="Choose GRN"
                options={[
                  { value: "g1", label: "GRN 1" },
                  { value: "g2", label: "GRN 2" },
                  { value: "g3", label: "GRN 3" },
                  { value: "g4", label: "GRN 4" },
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
              Vessel & Schedule
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Vessel details and shipment timeline
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Planned Vessel Name"
                id="vessel-name"
                placeholder="Enter Vessel Name"
                value={vesselName}
                onChange={setVesselName}
              />

              <FormField
                label="Voyage No"
                id="voyage-no"
                placeholder="Enter Voyage No"
                value={voyageNo}
                onChange={setVoyageNo}
              />

              <FormSelect
                label="Estimated Time of Delivery"
                value={estimatedTimeOfDelivery}
                onValueChange={setEstimatedTimeOfDelivery}
                placeholder="Choose Estimated Time of Delivery"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
              />

              <FormSelect
                label="Estimated Time of Arrival"
                value={estimatedTimeOfArrival}
                onValueChange={setEstimatedTimeOfArrival}
                placeholder="Choose Estimated Time of Arrival"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
              />

              <FormSelect
                label="Actual Time of Delivery"
                value={actualTimeOfDelivery}
                onValueChange={setActualTimeOfDelivery}
                placeholder="Choose Actual Time of Delivery"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
              />

              <FormSelect
                label="Actual Time of Arrival"
                value={actualTimeOfArrival}
                onValueChange={setActualTimeOfArrival}
                placeholder="Choose Actual Time of Arrival"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Cargo Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Cargo measurements and destination details
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <PortMultiSelect
                label="Arrival Port"
                selected={arrivalPorts}
                onChange={setArrivalPorts}
                ports={availablePorts}
              />

              <FormSelect
                label="Inland Location"
                value={inlandLocation}
                onValueChange={setInlandLocation}
                placeholder="Choose Inland Location"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
              />

              <FormField
                label="No. of Pieces"
                id="no-of-pieces"
                placeholder="Enter No. of Pieces"
                value={noOfPieces}
                onChange={setNoOfPieces}
              />

              <FormField
                label="Gross Weight"
                id="gross-weight"
                placeholder="Enter Gross Weight"
                value={grossWeight}
                onChange={setGrossWeight}
              />

              <FormField
                label="Chargeable Weight"
                id="chargeable-weight"
                placeholder="Enter Chargeable Weight"
                value={chargeableWeight}
                onChange={setChargeableWeight}
              />

              <FormField
                label="CMB"
                id="cmb"
                placeholder="Enter CMB"
                value={cmb}
                onChange={setCmb}
              />

              <FormField
                label="Container Seal No"
                id="container-seal-no"
                placeholder="Enter Container Seal No"
                value={containerSealNo}
                onChange={setContainerSealNo}
              />

              <FormSelect
                label="Onboarded date"
                value={onboardedDate}
                onValueChange={setOnboardedDate}
                placeholder="Choose Onboarded date"
                options={[
                  { value: "p1", label: "List 1" },
                  { value: "p2", label: "List 2" },
                  { value: "p3", label: "List 3" },
                ]}
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
