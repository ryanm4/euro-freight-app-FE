"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { fetchPackingListById } from "@/lib/api/packing_lists"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

export default function PLByID() {
  const { id } = useParams<{ id: string }>()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["packing-list", id],
    queryFn: () => fetchPackingListById(id),
  })

  if (isLoading) return <div>Loading…</div>
  if (isError || !res?.data) return <>Not found</>

  const data = res.data

  console.log("data", data)

  return (
    <div className="mx-6 space-y-5">
      <div className="mt-3">
        <PageTitleWithBreadcrumb
          title={`Packing List`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Packing Lists", href: "/packing-list" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button className="rounded-md" disabled>
          Edit
        </Button>
      </div>
    </div>
  )
}
