"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { SHIPMENT } from "@/modules/shipment/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { shipmentColumns } from "./_components/shipment-columns"
import { DataTable } from "./_components/shipment-table"

export default function ShipmentPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/shipment/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/shipment/view/${id}`),
  }

  const columns = shipmentColumns(actions)
  const data: SHIPMENT[] = [
    {
      id: 1,
      vessel_name: "Ever Given",
      status: "active",
      created_by: "john.doe",
      created_on: "2025-01-10T09:00:00",
      updated_by: "john.doe",
      updated_on: "2025-01-11T10:00:00",
    },
    {
      id: 2,
      vessel_name: "MSC Oscar",
      status: "pending",
      created_by: "jane.smith",
      created_on: "2025-01-20T10:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 3,
      vessel_name: "CMA CGM Marco Polo",
      status: "inactive",
      created_by: "mike.johnson",
      created_on: "2025-02-05T08:00:00",
      updated_by: "mike.johnson",
      updated_on: "2025-02-06T09:00:00",
    },
    {
      id: 4,
      vessel_name: null,
      status: "pending",
      created_by: "sarah.connor",
      created_on: "2025-02-18T14:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 5,
      vessel_name: "Maersk Seletar",
      status: "active",
      created_by: "tom.harris",
      created_on: "2025-03-01T10:00:00",
      updated_by: "tom.harris",
      updated_on: "2025-03-02T08:00:00",
    },
  ]

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-[24px] pt-0">
      <PageTitleWithBreadcrumb
        title="Shipment"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-[24px]">
        {/* <div className="relative w-[320px]">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div> */}
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
