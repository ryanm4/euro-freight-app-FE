"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { GOODS_RECEIVE_NOTE } from "@/modules/grn/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { goodsReceiveNoteColumns } from "./_components/grn-columns"
import { DataTable } from "./_components/grn-table"

export default function GRNPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/grn/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/grn/view/${id}`),
  }

  const columns = goodsReceiveNoteColumns(actions)
  const data: GOODS_RECEIVE_NOTE[] = [
    {
      id: 1,
      client_id: 101,
      manufacture_id: 501,
      forwarder_id: 601,
      date: "2025-01-10T09:00:00",
      quantity: 200,
      bill_id: 701,
      status: "active",
      created_by: "john.doe",
      created_on: "2025-01-10T09:00:00",
      updated_by: "john.doe",
      updated_on: "2025-01-11T10:00:00",
    },
    {
      id: 2,
      client_id: 102,
      manufacture_id: 502,
      forwarder_id: null,
      date: "2025-01-18T11:30:00",
      quantity: 350,
      bill_id: 702,
      status: "pending",
      created_by: "jane.smith",
      created_on: "2025-01-18T11:30:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 3,
      client_id: 103,
      manufacture_id: null,
      forwarder_id: 602,
      date: "2025-02-05T08:45:00",
      quantity: 120,
      bill_id: null,
      status: "inactive",
      created_by: "mike.johnson",
      created_on: "2025-02-05T08:45:00",
      updated_by: "mike.johnson",
      updated_on: "2025-02-06T09:15:00",
    },
    {
      id: 4,
      client_id: null,
      manufacture_id: 503,
      forwarder_id: 603,
      date: "2025-02-14T14:00:00",
      quantity: 475,
      bill_id: 703,
      status: "active",
      created_by: "sarah.connor",
      created_on: "2025-02-14T14:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 5,
      client_id: 104,
      manufacture_id: 504,
      forwarder_id: 604,
      date: null,
      quantity: 80,
      bill_id: 704,
      status: "pending",
      created_by: "tom.harris",
      created_on: "2025-03-01T10:30:00",
      updated_by: "tom.harris",
      updated_on: "2025-03-02T11:00:00",
    },
    {
      id: 6,
      client_id: 105,
      manufacture_id: 505,
      forwarder_id: null,
      date: "2025-03-10T15:00:00",
      quantity: null,
      bill_id: null,
      status: null,
      created_by: "emily.clark",
      created_on: "2025-03-10T15:00:00",
      updated_by: null,
      updated_on: null,
    },
  ]

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-[24px] pt-0">
      <PageTitleWithBreadcrumb
        title="Good Received Notes"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-[24px]">
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
        <Button onClick={() => router.push("/grn/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={data} searchValue={searchValue} />
      </div>
    </div>
  )
}
