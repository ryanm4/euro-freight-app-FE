"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import PackingListForm from "../_components/packing-list-form"
import { usePackingListContext } from "@/contexts/packing-list-context"

export default function PackingListCreatePage() {
  const { uploadedData } = usePackingListContext()

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Packing List"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Packing List", href: "/packing-list" },
        ]}
      />

      <div className="mt-4">
        <PackingListForm uploadedData={uploadedData} />
      </div>
    </div>
  )
}
