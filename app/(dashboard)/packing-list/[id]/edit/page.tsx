"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import PackingListForm from "../../_components/packing-list-form"
import { fetchPackingListById } from "@/lib/api/packing_lists"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export default function PackingListEditPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["packing-list", id],
    queryFn: () => fetchPackingListById(id),
    enabled: !!id,
    refetchOnMount: "always",
    staleTime: 0,
  })

  if (isLoading) {
    return (
      <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded bg-muted" />
      </div>
    )
  }

  if (isError || !res?.data) {
    return (
      <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
        <p className="text-sm text-destructive">Packing list not found.</p>
      </div>
    )
  }

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Edit Packing List"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Packing List", href: "/packing-list" },
        ]}
      />

      <div className="mt-4">
        <PackingListForm
          initialData={res.data}
          mode="edit"
          packingListId={id}
        />
      </div>
    </div>
  )
}
