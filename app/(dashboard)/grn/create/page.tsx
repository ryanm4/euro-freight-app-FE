"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { useRouter } from "next/navigation"
import GoodsReceiveNoteForm from "../_components/grn-form"

export default function PurchaseOrderCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Add"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Good Received Notes", href: "/grn" },
        ]}
      />

      <div className="mt-4">
        <GoodsReceiveNoteForm />
      </div>
    </div>
  )
}
