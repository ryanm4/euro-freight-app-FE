"use client"

import FormField from "@/components/shared/FormField"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchShipmentById } from "@/lib/api/shipments"
import { SHIPMENT } from "@/modules/shipment/types"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import HBLTable from "../_components/HBLTable"

export default function ShipmentByID() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => fetchShipmentById(id),
  })

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data as SHIPMENT

  const handleHblRowClick = (hbl: any) => {
    // Function to handle HBL row click - would navigate to HBL view page
    // Navigation logic would go here, e.g., router.push(`/hbl-hawb/${hbl.id}`)
    console.log("Navigate to HBL view:", hbl.id)
  }

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          // title={`Shipment-${id}`}
          title={`Shipment`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Shipment", href: "/shipment" },
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
              Vessel Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Core shipment information and vessel details
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                label="Vessel Name"
                id="vessel-name"
                placeholder="Enter Vessel Name"
                value={data.vessel_name ?? ""}
                readOnly={true}
              />

              <FormField
                label="Status"
                id="status"
                placeholder="Enter Status"
                value={data.status ?? ""}
                readOnly={true}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              HBL / HAWB Information
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              List of associated House Bill of Lading / House Air Waybill
              records
            </p>
          </div>

          <div className="space-y-4">
            <div className="overflow-x-auto rounded-md border border-neutral-700">
              <HBLTable
                hbls={(data.hbl_hawb_details ?? []) as any[]}
                readOnly={true}
                onRowClick={handleHblRowClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
