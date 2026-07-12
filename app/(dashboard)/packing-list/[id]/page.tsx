"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

      <div className="grid grid-cols-1 gap-4">
        {/* Card 1: Create Packing List */}
        <Card className="flex w-full flex-col shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-col gap-[0.5px]">
            <h3 className="text-md mb-2 font-medium">Create Packing List</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              Important dates, documents, and shipment instructions.
            </p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-foreground">
                Client Name
              </Label>
              <Input
                id="client_id"
                placeholder="Client"
                value={data.client_id}
                // onChange={(e) => setPoQuantity(e.target.value)}
                className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
