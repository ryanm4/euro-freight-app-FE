"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchRoles } from "@/lib/api/roles"
import { ROLE_LIST } from "@/modules/roles/types"
import { IconPlus } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { roleColumns } from "./_components/roles-columns"
import { DataTable } from "./_components/roles-table"

export default function RolesPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(),
  })

  const actions = {
    onEdit: (id: string) => router.push(`/roles/${id}/edit`),
    onDelete: (id: string) => {},
    onView: (id: string) => router.push(`/roles/${id}`),
  }

  const columns = roleColumns(actions)

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Roles"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      <div className="flex flex-row justify-end gap-6">
        <Button onClick={() => router.push("/roles/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as ROLE_LIST[]}
          searchValue={searchValue}
          isLoading={false}
        />
      </div>
    </div>
  )
}
