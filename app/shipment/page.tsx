"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconSearch, IconPlus } from "@tabler/icons-react"
import { DataTable } from "./_components/shipment-table"
import { shipmentColumns } from "./_components/shipment-columns"
import { SHIPMENT } from "@/modules/shipment/types"

export default function ShipmentPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/shipment/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/shipment/view/${id}`),
  }

  const columns = shipmentColumns(actions)
  const data: SHIPMENT[] = []

  return (
    <div className="flex flex-1 flex-col gap-4 p-[24px] pt-0 mt-3">
      <PageTitleWithBreadcrumb
        title="Shipment"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-[24px]">
        <div className="relative w-[320px]">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/shipment/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={data} searchValue={searchValue} />
      </div>
    </div>
  )
}
