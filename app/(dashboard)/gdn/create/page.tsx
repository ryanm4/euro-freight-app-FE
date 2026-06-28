"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import GoodsDispatchNoteForm from "../_components/gdn-form"

export default function PurchaseOrderCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Goods Dispatched Note"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Goods Dispatched Notes", href: "/gdn" },
          { title: "Add", href: "/gdn/create" },
        ]}
      />

      <div className="mt-4">
        <GoodsDispatchNoteForm />
      </div>
    </div>
  )
}
