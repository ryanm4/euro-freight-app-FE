"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconSearch, IconPlus } from "@tabler/icons-react"
import { DataTable } from "./_components/purchase-order-table"
import { purchaseOrderColumns } from "./_components/purchase-order-columns"

export default function PurchaseOrderPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/purchase-order/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/purchase-order/view/${id}`),
    onStatusChange: (id: string, status: string) => console.log("Status change", id, status)
  }

  const columns = purchaseOrderColumns(actions)

  // Empty data array for now until the API is integrated
  const data: any[] = []

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Purchase Order Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-[24px]">
        <div className="relative w-[320px]">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="PO Number"
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <Button
          onClick={() => router.push("/purchase-order/create")}
        >
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={data}
          searchValue={searchValue}
        />
      </div>
    </div>
  )
}
