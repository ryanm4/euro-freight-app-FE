"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import ShipmentForm from "../_components/ShipmentForm"

export default function ShipmentCreatePage() {
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Add"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Shipment", href: "/shipment" },
        ]}
      />

      <div className="mt-4">
        <ShipmentForm />
      </div>
    </div>
  )
}
