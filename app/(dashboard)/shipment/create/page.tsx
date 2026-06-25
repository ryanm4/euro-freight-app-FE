"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ShipmentForm from "../_components/ShipmentForm"

export default function ShipmentCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Shipment"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Shipment", href: "/shipment" },
          { title: "Add", href: "/shipment/create" },
        ]}
      />

      <div className="flex flex-row justify-end gap-6">
        <Button
          variant={"outline"}
          className="rounded-md"
          onClick={() => router.push("/shipment")}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={() => router.push("/shipment")}>
          Save
        </Button>
      </div>

      <div className="mt-4">
        <ShipmentForm />
      </div>
    </div>
  )
}
