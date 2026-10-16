"use client"

import React, { useState } from "react"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { DataTable } from "./_components/hbl-dashboard-table"
import { HBL_PO_Dashboard_List } from "@/modules/hbl-dashboard/types"
import { hbl_dashboard_SEA_Columns } from "./_components/hbl-dashboard-columns-sea"
import { hbl_dashboard_AIR_Columns } from "./_components/hbl-dashboard-columns-air"
import { useQuery } from "@tanstack/react-query"
import { fetchHBLDashboardData } from "@/lib/api/hbl_dashboard"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HBLCostDialog } from "./_components/hbl-cost-dialog"

export default function HBLDashboardPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [selectedHbl, setSelectedHbl] = useState<
    HBL_PO_Dashboard_List["data"][number] | null
  >(null)

  const { data, isLoading } = useQuery({
    queryKey: ["hbl-dashboard", ""],
    queryFn: () => fetchHBLDashboardData(),
  })

  const dashboardData = data as HBL_PO_Dashboard_List | undefined
  const airData = {
    data: dashboardData?.data.filter((hbl) => hbl.type === "AIR") ?? [],
  }
  const seaData = {
    data: dashboardData?.data.filter((hbl) => hbl.type === "SEA") ?? [],
  }

  const actions = {
    // onEdit: (id: string) => router.push(`/hbl-hawb/${id}/edit`),
    onCostView: (hbl: HBL_PO_Dashboard_List["data"][number]) =>
      setSelectedHbl(hbl),
    onView: (id: string) => router.push(`/hbl-hawb/${id}`),
  }

  const sea_columns = hbl_dashboard_SEA_Columns(actions)
  const air_columns = hbl_dashboard_AIR_Columns(actions)

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="HBL Dashboard"
        breadcrumbs={[{ title: "Dashboard", href: "/hbl-dashboard" }]}
      />
      <div className="mt-4">
        <HBLCostDialog
          key={selectedHbl?.id ?? "closed"}
          hbl={selectedHbl}
          open={selectedHbl !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedHbl(null)
          }}
        />
        <Tabs defaultValue="air" className="w-full">
          <TabsList>
            <TabsTrigger value="air">Air</TabsTrigger>
            <TabsTrigger value="sea">Sea</TabsTrigger>
          </TabsList>
          <TabsContent value="air">
            <div className="mt-4">
              <DataTable
                columns={air_columns}
                data={airData.data}
                searchValue={searchValue}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
          <TabsContent value="sea">
            <div className="mt-4">
              <DataTable
                columns={sea_columns}
                data={seaData.data}
                searchValue={searchValue}
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
