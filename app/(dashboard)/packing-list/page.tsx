"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { PACKING_LIST } from "@/modules/packing-list/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { packingListColumns } from "./_components/packing-list-columns"
import { DataTable } from "./_components/packing-list-table"
import { packingListApi } from "@/modules/packing-list/api"

export default function PackingListPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [data, setData] = useState<PACKING_LIST[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const actions = {
    onEdit: (id: string) => router.push(`/packing-list/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/packing-list/view/${id}`),
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const response = await packingListApi.getAll()

      if (response.status === 200) {
        setData(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch inventory")
    } finally {
      setIsLoading(false)
    }
  }
  const columns = packingListColumns(actions)

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
