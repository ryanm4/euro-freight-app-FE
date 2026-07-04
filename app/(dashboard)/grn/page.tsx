"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import { GOODS_RECEIVE_NOTE } from "@/modules/grn/types"
import { IconPlus } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { goodsReceiveNoteColumns } from "./_components/grn-columns"
import { DataTable } from "./_components/grn-table"

export default function GRNPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["grns"],
    queryFn: fetchGRNs, 
  })

  const actions = {
    onEdit: (id: string) => router.push(`/grn/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/grn/${id}`),
  }

  const columns = goodsReceiveNoteColumns(actions)

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Goods Received Notes"
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
        <Button onClick={() => router.push("/grn/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as GOODS_RECEIVE_NOTE[]}
          searchValue={searchValue}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
