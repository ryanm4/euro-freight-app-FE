"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import PackingListForm from "../_components/packing-list-form"

export default function PackingListCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Packing List"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Packing List", href: "/packing-list" },
          { title: "Add", href: "/packing-list/create" },
        ]}
      />

       
      <div className="mt-4">
        <PackingListForm />
      </div>
    </div>
  )
}
