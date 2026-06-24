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
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      {/* <div className="flex flex-row justify-end gap-6">
        <Button
          variant={"outline"}
          className="rounded-md"
          onClick={() => router.push("/purchase-order")}
        >
          Cancel
        </Button>
        <Button
          className="rounded-md"
          onClick={() => router.push("/purchase-order")}
        >
          Save
        </Button>
      </div> */}

      <div className="mt-4">
        <PurchaseOrderForm />
      </div>
    </div>
  )
}
