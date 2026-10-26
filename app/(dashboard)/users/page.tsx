"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { fetchUsers } from "@/lib/api/users"
import { USER_LIST } from "@/modules/users/types"
import { useQuery } from "@tanstack/react-query"
import { DataTable } from "./_components/user-table"
import { useState } from "react"
import { userColumns } from "./_components/user-columns"
import router from "next/router"

export default function UsersPage() {
  const [searchValue, setSearchValue] = useState("")
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  })

  const acUsers = {
    onEdit: (id: string) => router.push(`/users/${id}/edit`),
    onDelete: (id: string) => {},
    onView: (id: string) => router.push(`/users/${id}`),
  }

  const columns = userColumns(acUsers, { canModify: true })




  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Users"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load users."}
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          searchValue={searchValue}
        />
      )}
    </div>
  )
}
