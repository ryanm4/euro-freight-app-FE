import FormDateField from "@/components/shared/FormDateField"
import FormField from "@/components/shared/FormField"
import FormSelect from "@/components/shared/FormSelect"
import FormTextarea from "@/components/shared/FormTextarea"
import { Button } from "@/components/ui/button"
import { createBillOfLading } from "@/lib/api/bill_of_lading"
import { fetchClients } from "@/lib/api/clients"
import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import GRNTable, { GRN } from "./GRNTable"

interface Port {
  id: number
  value: string
}

export default function HBLHABWForm() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const [type, setType] = useState("")
  const [date, setDate] = useState("")
  const [client, setClient] = useState("")
  const [manufacturer, setManufacturer] = useState("")
  const [mblMawbNo, setMblMawbNo] = useState("")
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
  // const [arrivalPorts, setArrivalPorts] = useState<Port[]>([])

  const [selectedGrnIds, setSelectedGrnIds] = useState<Set<number>>(new Set())

  const [ports, setPorts] = useState<Port[]>([{ id: 1, value: "" }])

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const {
    data: grnData,
    // isLoading,
    // error,
  } = useQuery({
    queryKey: ["grns"],
    queryFn: fetchGRNs,
  })
  // data={(data?.data ?? []) as GOODS_RECEIVE_NOTE[]}

  const supplierOptions = useMemo(() => {
    return data?.data?.filter((client: any) => client.type === "supplier") || []
  }, [data])

  const manufacturerOptions = useMemo(() => {
    return (
      data?.data?.filter((client: any) => client.type === "manufacturer") || []
    )
  }, [data])

  const toggleGrn = (id: number) => {
    setSelectedGrnIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const addPort = () => {
    setPorts((prev) => [...prev, { id: Date.now(), value: "" }])
  }

  const removePort = (id: number) => {
    setPorts((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePort = (id: number, value: string) => {
    setPorts((prev) => prev.map((p) => (p.id === id ? { ...p, value } : p)))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await createBillOfLading({
        client,
        manufacturer,
        date,
        type,
        vesselName,
        voyageNo,
        estimatedTimeOfDelivery,
        estimatedTimeOfArrival,
        arrivalPort,
        inlandLocation,
        mblMawbNo,
        noOfPieces,
        grossWeight,
        chargeableWeight,
        cmb,
        containerSealNo,
        onboardedDate,
        selectedGrnIds,
        ports,
      })
      router.push("/hbl-hawb")
    } catch (err) {
      console.error(err)
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
          onClick={() => router.push("/hbl-hawb")}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button className="rounded-md" disabled={isSaving} onClick={handleSave}>
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
                  { value: "SEA", label: "Sea" },
                  { value: "AIR", label: "Air" },
                ]}
              />

              <FormDateField
                label="Date"
                id={`date`}
                value={date}
                onChange={setDate}
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
                options={supplierOptions.map((s: any) => ({
                  value: s.id,
                  label: s.name,
                }))}
              />

              <FormSelect
                label="Manufacturer"
                value={manufacturer}
                onValueChange={setManufacturer}
                placeholder="Choose Manufacturer"
                options={manufacturerOptions.map((m: any) => ({
                  value: m.id,
                  label: m.name,
                }))}
              />

              <FormField
                label="MBL / MAWB No"
                id="mbl-mawb-no"
                placeholder="Enter MBL / MAWB No"
                value={mblMawbNo}
                onChange={setMblMawbNo}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">GRNs</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of available Goods Received Notes
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <GRNTable
                grns={(grnData?.data ?? []) as GRN[]}
                selectedIds={selectedGrnIds}
                onToggle={toggleGrn}
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

              <FormDateField
                label="Estimated Time of Delivery"
                id={`estimated-time-of-delivery`}
                value={estimatedTimeOfDelivery}
                onChange={setEstimatedTimeOfDelivery}
              />

              <FormDateField
                label="Estimated Time of Arrival"
                id={`estimated-time-of-arrival`}
                value={estimatedTimeOfArrival}
                onChange={setEstimatedTimeOfArrival}
              />

              <FormDateField
                label="Actual Time of Delivery"
                id={`actual-time-of-delivery`}
                value={actualTimeOfDelivery}
                onChange={setActualTimeOfDelivery}
              />

              <FormDateField
                label="Actual Time of Arrival"
                id={`actual-time-of-arrival`}
                value={actualTimeOfArrival}
                onChange={setActualTimeOfArrival}
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
              <FormField
                label="Arrival Port"
                id="arrival-port"
                placeholder="Enter Arrival Port"
                value={arrivalPort}
                onChange={setArrivalPort}
              />

              <FormField
                label="Inland Location"
                id="inland-location"
                placeholder="Enter Inland Location"
                value={inlandLocation}
                onChange={setInlandLocation}
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

              <FormDateField
                label="Onboarded date"
                id={`onboarded-date`}
                value={onboardedDate}
                onChange={setOnboardedDate}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Additional Port Information
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Packing lists and carton quantities.
              </p>
            </div>
            <button
              onClick={addPort}
              className="flex items-center gap-1.5 rounded-md border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-xs text-zinc-100 transition-colors hover:bg-neutral-700"
            >
              <IconPlus size={13} />
              Add Port
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {ports.map((port) => (
                <div key={port.id} className="flex items-end gap-2">
                  <FormField
                    label="Arrival Port"
                    id={`port-${port.id}`}
                    placeholder="Enter port name"
                    value={port.value}
                    onChange={(v) => updatePort(port.id, v)}
                    className="flex-1"
                  />
                  <button
                    onClick={() => removePort(port.id)}
                    disabled={ports.length === 1}
                    className="mb-0.5 flex items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 p-2 text-zinc-400 transition-colors hover:bg-neutral-700 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <IconTrash size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
