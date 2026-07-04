"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchHBLHAWBs } from "@/lib/api/bill_of_lading"
import { HBL_HAWB } from "@/modules/hbl-hawb/types"
import { IconPlus } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { hblHawbColumns } from "./_components/hbl-hawb-columns"
import { DataTable } from "./_components/hbl-hawb-table"

export default function HBLHAWBPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["hbl-hawbs"],
    queryFn: fetchHBLHAWBs,
  })

  const actions = {
    onEdit: (id: string) => router.push(`/hbl-hawb/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/hbl-hawb/${id}`),
  }

  const columns = hblHawbColumns(actions)

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-[24px] pt-0">
      <PageTitleWithBreadcrumb
        title="HBL / HAWB"
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
        <Button onClick={() => router.push("/hbl-hawb/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as HBL_HAWB[]}
          searchValue={searchValue}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
