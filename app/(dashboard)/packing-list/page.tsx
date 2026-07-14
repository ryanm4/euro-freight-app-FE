"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchPackingLists } from "@/lib/api/packing_lists"
import { PACKING_LIST } from "@/modules/packing-list/types"
import { IconPlus } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { packingListColumns } from "./_components/packing-list-columns"
import { DataTable } from "./_components/packing-list-table"
import { PackingListUploadDialog } from "./_components/packing-list-upload-dialog"

export default function PackingListPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  const actions = useMemo(
    () => ({
      onEdit: (id: string) => router.push(`/packing-list/edit/${id}`),
      onDelete: (id: string) => console.log("Delete", id),
      onView: (id: string) => router.push(`/packing-list/${id}`),
    }),
    [router]
  )

  const {
    data,
    isLoading,
    // error,
  } = useQuery({
    queryKey: ["packing-lists"],
    queryFn: fetchPackingLists,
  })

  const columns = useMemo(() => packingListColumns(actions), [actions])

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
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" /> Upload Packing List
        </Button>
      </div>
      <div className="mt-4">
        <DataTable
          columns={columns}
          data={(data?.data ?? []) as PACKING_LIST[]}
          searchValue={searchValue}
          isLoading={isLoading}
        />
      </div>
      <PackingListUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  )
}
