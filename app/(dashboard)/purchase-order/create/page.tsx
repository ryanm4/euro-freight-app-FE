"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { useRouter } from "next/navigation"
import PurchaseOrderForm from "../_components/purchase-order-form"

export default function PurchaseOrderCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Purchase Order Creation"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Purchase Order", href: "/purchase-order" },
        ]}
      />

      <div className="mt-4">
        <PurchaseOrderForm />
      </div>
    </div>
  )
}
