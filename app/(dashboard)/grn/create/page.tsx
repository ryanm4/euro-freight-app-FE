"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import GoodsReceiveNoteForm from "../_components/grn-form"

export default function PurchaseOrderCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Good Received Note"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Good Received Notes", href: "/grn" },
          { title: "Add", href: "/grn/create" },
        ]}
      />

      <div className="flex flex-row justify-end gap-6">
        <Button
          variant={"outline"}
          className="rounded-md"
          onClick={() => router.push("/grn")}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={() => router.push("/grn")}>
          Save
        </Button>
      </div>

      <div className="mt-4">
        <GoodsReceiveNoteForm />
      </div>
    </div>
  )
}
