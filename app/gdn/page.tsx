"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { GOODS_DELIVER_NOTE } from "@/modules/gdn/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { goodsDeliverNoteColumns } from "./_components/gdn-columns"
import { DataTable } from "./_components/gdn-table"

export default function GDNPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/gdn/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/gdn/view/${id}`),
  }

  const columns = goodsDeliverNoteColumns(actions)
  const data: GOODS_DELIVER_NOTE[] = [
    {
      id: 1,
      client_id: 101,
      manufacture_id: 501,
      forwarder_id: 601,
      date: "2025-01-12T09:00:00",
      cartoons: "50",
      actual_cartoons: "48",
      gross_weight: "1200.00",
      actual_gross_weight: "1180.00",
      gross_volume: "10.5",
      actual_gross_volume: "10.2",
      status: "active",
      created_by: "john.doe",
      created_on: "2025-01-12T09:00:00",
      updated_by: "john.doe",
      updated_on: "2025-01-13T10:00:00",
      gdn_grn_ref: "GDN-2025-001",
      vehicle_no: "WP-CAB-1234",
    },
    {
      id: 2,
      client_id: 102,
      manufacture_id: 502,
      forwarder_id: null,
      date: "2025-01-20T11:30:00",
      cartoons: "80",
      actual_cartoons: "80",
      gross_weight: "2000.00",
      actual_gross_weight: "2000.00",
      gross_volume: "18.0",
      actual_gross_volume: "18.0",
      status: "pending",
      created_by: "jane.smith",
      created_on: "2025-01-20T11:30:00",
      updated_by: null,
      updated_on: null,
      gdn_grn_ref: "GDN-2025-002",
      vehicle_no: "WP-KK-5678",
    },
    {
      id: 3,
      client_id: 103,
      manufacture_id: null,
      forwarder_id: 602,
      date: "2025-02-05T08:00:00",
      cartoons: "30",
      actual_cartoons: "28",
      gross_weight: "750.00",
      actual_gross_weight: "740.00",
      gross_volume: "6.8",
      actual_gross_volume: null,
      status: "inactive",
      created_by: "mike.johnson",
      created_on: "2025-02-05T08:00:00",
      updated_by: "mike.johnson",
      updated_on: "2025-02-06T09:00:00",
      gdn_grn_ref: null,
      vehicle_no: "CP-NA-9101",
    },
    {
      id: 4,
      client_id: null,
      manufacture_id: 503,
      forwarder_id: 603,
      date: "2025-02-18T14:00:00",
      cartoons: "120",
      actual_cartoons: null,
      gross_weight: "3100.00",
      actual_gross_weight: null,
      gross_volume: "28.5",
      actual_gross_volume: null,
      status: "pending",
      created_by: "sarah.connor",
      created_on: "2025-02-18T14:00:00",
      updated_by: null,
      updated_on: null,
      gdn_grn_ref: "GDN-2025-004",
      vehicle_no: null,
    },
    {
      id: 5,
      client_id: 104,
      manufacture_id: 504,
      forwarder_id: 604,
      date: null,
      cartoons: "60",
      actual_cartoons: "60",
      gross_weight: "1500.00",
      actual_gross_weight: "1498.00",
      gross_volume: "14.0",
      actual_gross_volume: "14.0",
      status: "active",
      created_by: "tom.harris",
      created_on: "2025-03-01T10:00:00",
      updated_by: "tom.harris",
      updated_on: "2025-03-02T08:30:00",
      gdn_grn_ref: "GDN-2025-005",
      vehicle_no: "NW-PB-1122",
    },
  ]

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Goods Dispatched Notes"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-6">
        {/* <div className="relative w-[320px]">
          <IconSearch className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div> */}
        <Button onClick={() => router.push("/gdn/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={data} searchValue={searchValue} />
      </div>
    </div>
  )
}
