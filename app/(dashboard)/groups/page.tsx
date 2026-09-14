"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchGroups } from "@/lib/api/groups"
import { GROUP_LIST } from "@/modules/groups/types"
import { IconPlus } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { groupColumns } from "./_components/groups-columns"
import { DataTable } from "./_components/groups-table"

export default function GroupsPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetchGroups(),
  })

  const actions = {
    onEdit: (id: string) => router.push(`/groups/${id}/edit`),
    onDelete: (id: string) => {},
    onView: (id: string) => router.push(`/groups/${id}`),
  }

  const columns = groupColumns(actions)

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Groups"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      <div className="flex flex-row justify-end gap-6">
        <Button onClick={() => router.push("/groups/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as GROUP_LIST[]}
          searchValue={searchValue}
          isLoading={false}
        />
      </div>
    </div>
  )
}
