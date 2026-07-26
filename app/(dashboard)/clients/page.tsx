"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchClients } from "@/lib/api/clients"
import { CLIENT_LIST } from "@/modules/clients/types"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { clientColumns } from "./_components/client-columns"
import { DataTable } from "./_components/client-table"

export default function ClientsPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: fetchClients,
  })

  const actions = {
    onEdit: (id: string) => router.push(`/clients/edit/${id}`),
    onDelete: (id: string) => console.log("Delete client:", id),
    onView: (id: string) => router.push(`/clients/${id}`),
  }

  const columns = clientColumns(actions)

  const clientList = (data?.data ?? data ?? []) as CLIENT_LIST[]

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-[24px] pt-0">
      <PageTitleWithBreadcrumb
        title="Clients"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-between gap-[24px]">
        <div className="relative w-[320px]">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/clients/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={clientList}
          searchValue={searchValue}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
