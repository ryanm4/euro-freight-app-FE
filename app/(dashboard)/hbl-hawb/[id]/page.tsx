"use client"

import FormDateField from "@/components/shared/FormDateField"
import FormField from "@/components/shared/FormField"
import FormTextarea from "@/components/shared/FormTextarea"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchBillOfLadingById } from "@/lib/api/bill_of_lading"
import { IconTrash } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import GRNTable from "../_components/GRNTable"

export default function HBLHAWBByID() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["hbl-hawb", id],
    queryFn: () => fetchBillOfLadingById(id),
  })

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data

  console.log("data", data)

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`HBL/HAWB-${id}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "HBL / HAWB", href: "/hbl-hawb" },
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
              Core shipment information and transport mode
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Type"
                id="type"
                placeholder="Enter Type"
                value={data.type}
              />

              <FormDateField
                label="Date"
                id={`date`}
                value={data.date}
                readOnly={true}
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
              <FormField
                label="Client"
                id="client"
                placeholder="Enter Client"
                value={data.client_id}
                readOnly={true}
              />

              <FormField
                label="Manufacturer"
                id="manufacturer"
                placeholder="Enter Manufacturer"
                value={data.manufacture_id}
                readOnly={true}
              />

              <FormField
                label="MBL / MAWB No"
                id="mbl-mawb-no"
                placeholder="Enter MBL / MAWB No"
                value={data.mbl_mawb_no}
                readOnly={true}
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
              <GRNTable grns={data?.grns ?? []} readOnly={true} />
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
                value={data.vesselName}
                readOnly={true}
              />

              <FormField
                label="Voyage No"
                id="voyage-no"
                placeholder="Enter Voyage No"
                value={data.voyage_no}
                readOnly={true}
              />

              <FormDateField
                label="Estimated Time of Delivery"
                id={`estimated-time-of-delivery`}
                value={data.etd}
                readOnly={true}
              />

              <FormDateField
                label="Estimated Time of Arrival"
                id={`estimated-time-of-arrival`}
                value={data.eta}
                readOnly={true}
              />

              <FormDateField
                label="Actual Time of Delivery"
                id={`actual-time-of-delivery`}
                value={data.actual_eta}
                readOnly={true}
              />

              <FormDateField
                label="Actual Time of Arrival"
                id={`actual-time-of-arrival`}
                value={data.actual_etd}
                readOnly={true}
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
                value={data.arrival_port}
                readOnly={true}
              />

              <FormField
                label="Inland Location"
                id="inland-location"
                placeholder="Enter Inland Location"
                value={data.inland_location}
                readOnly={true}
              />

              <FormField
                label="No. of Pieces"
                id="no-of-pieces"
                placeholder="Enter No. of Pieces"
                value={data.no_pieces}
                readOnly={true}
              />

              <FormField
                label="Gross Weight"
                id="gross-weight"
                placeholder="Enter Gross Weight"
                value={data.gross_weight}
                readOnly={true}
              />

              <FormField
                label="Chargeable Weight"
                id="chargeable-weight"
                placeholder="Enter Chargeable Weight"
                value={data.chargeable_weight}
                readOnly={true}
              />

              <FormField
                label="CBM"
                id="cbm"
                placeholder="Enter CBM"
                value={data.cbm}
                readOnly={true}
              />

              <FormField
                label="Container Seal No"
                id="container-seal-no"
                placeholder="Enter Container Seal No"
                value={data.container_seal_no}
                readOnly={true}
              />

              <FormDateField
                label="Onboarded date"
                id={`onboarded-date`}
                value={data.onboard_date}
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
                value={data.remarks ?? "-"}
                readOnly={true}
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
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {data.ports.map((port: any) => (
                <div key={port.id} className="flex items-end gap-2">
                  <FormField
                    label="Arrival Port"
                    id={`port-${port.id}`}
                    placeholder="Enter port name"
                    value={port.port}
                    className="flex-1"
                    readOnly={true}
                  />
                  <button
                    disabled={true}
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
