"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { PACKING_LIST } from "@/modules/packing-list/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { packingListColumns } from "./_components/packing-list-columns"
import { DataTable } from "./_components/packing-list-table"

export default function PackingListPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/packing-list/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/packing-list/view/${id}`),
  }

  const columns = packingListColumns(actions)
  const data: PACKING_LIST[] = [
    {
      id: 1,
      client_id: 101,
      date: "2025-01-15T08:30:00",
      gdn_id: 201,
      grn_id: 301,
      quantity: 150,
      created_by: "john.doe",
      created_on: "2025-01-15T08:30:00",
      updated_by: "john.doe",
      updated_on: "2025-01-15T08:30:00",
    },
    {
      id: 2,
      client_id: 102,
      date: "2025-01-20T10:00:00",
      gdn_id: 202,
      grn_id: 302,
      quantity: 200,
      created_by: "jane.smith",
      created_on: "2025-01-20T10:00:00",
      updated_by: "jane.smith",
      updated_on: "2025-01-22T14:00:00",
    },
    {
      id: 3,
      client_id: 103,
      date: "2025-02-01T09:15:00",
      gdn_id: 203,
      grn_id: null,
      quantity: 75,
      created_by: "mike.johnson",
      created_on: "2025-02-01T09:15:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 4,
      client_id: 101,
      date: "2025-02-10T11:45:00",
      gdn_id: null,
      grn_id: 303,
      quantity: 320,
      created_by: "sarah.connor",
      created_on: "2025-02-10T11:45:00",
      updated_by: "sarah.connor",
      updated_on: "2025-02-11T09:00:00",
    },
    {
      id: 5,
      client_id: null,
      date: "2025-02-18T14:30:00",
      gdn_id: 204,
      grn_id: 304,
      quantity: 500,
      created_by: "tom.harris",
      created_on: "2025-02-18T14:30:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 6,
      client_id: 104,
      date: "2025-03-05T08:00:00",
      gdn_id: 205,
      grn_id: 305,
      quantity: 90,
      created_by: "emily.clark",
      created_on: "2025-03-05T08:00:00",
      updated_by: "emily.clark",
      updated_on: "2025-03-06T10:30:00",
    },
    {
      id: 7,
      client_id: 105,
      date: null,
      gdn_id: 206,
      grn_id: null,
      quantity: 410,
      created_by: "david.lee",
      created_on: "2025-03-12T13:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 8,
      client_id: 102,
      date: "2025-03-20T16:00:00",
      gdn_id: null,
      grn_id: 306,
      quantity: 60,
      created_by: "anna.white",
      created_on: "2025-03-20T16:00:00",
      updated_by: "anna.white",
      updated_on: "2025-03-21T08:45:00",
    },
  ]

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Packing List"
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
        <Button onClick={() => router.push("/packing-list/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable columns={columns} data={data} searchValue={searchValue} />
      </div>
    </div>
  )
}
