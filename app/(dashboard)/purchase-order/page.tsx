"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchPurchaseOrders } from "@/lib/api/purchase-orders"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { IconPlus } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { purchaseOrderColumns } from "./_components/purchase-order-columns"
import { DataTable } from "./_components/purchase-order-table"

export default function PurchaseOrderPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: fetchPurchaseOrders,
  })

  const actions = useMemo(
    () => ({
      onEdit: (id: string) => router.push(`/purchase-order/edit/${id}`),
      onDelete: (id: string) => console.log("Delete", id),
      onView: (id: string) => router.push(`/purchase-order/view/${id}`),
      onStatusChange: (id: string, status: string) =>
        console.log("Status change", id, status),
    }),
    [router]
  )

  const columns = useMemo(() => purchaseOrderColumns(actions), [actions])

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Purchase Order Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-6">
        {/* <div className="relative w-[320px]">
          <IconSearch className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="PO Number"
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div> */}

        <Button onClick={() => router.push("/purchase-order/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as PURCHASE_ORDER[]}
          searchValue={searchValue}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
