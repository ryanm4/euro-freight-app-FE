"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { HBL_HAWB } from "@/modules/hbl-hawb/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { hblHawbColumns } from "./_components/hbl-hawb-columns"
import { DataTable } from "./_components/hbl-hawb-table"

export default function HBLHAWBPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/hbl-hawb/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/hbl-hawb/view/${id}`),
  }

  const columns = hblHawbColumns(actions)
  const data: HBL_HAWB[] = [
    {
      id: 1,
      client_name: "Koren Spa",
      manufacture_id: 501,
      date: "2025-01-10T09:00:00",
      type: "HBL",
      shipment_id: 1001,
      planned_vessel_name: "Ever Given",
      voyage_no: "VOY-2025-001",
      etd: "2025-01-15T00:00:00",
      eta: "2025-02-01T00:00:00",
      actual_etd: "2025-01-16T00:00:00",
      actual_eta: "2025-02-03T00:00:00",
      arrival_port: "Colombo",
      inland_location: "Colombo ICD",
      mbl_mawb_no: "MBL-2025-001",
      status: "active",
      no_pieces: 120,
      gross_weight: "3200.00",
      chargeable_weight: "3100.00",
      cbm: "28.5",
      container_seal_no: "SEAL-001",
      onboard_date: "2025-01-16T00:00:00",
      created_by: "john.doe",
      created_on: "2025-01-10T09:00:00",
      updated_by: "john.doe",
      updated_on: "2025-01-17T10:00:00",
    },
    {
      id: 2,
      client_name: "Lacoste",
      manufacture_id: 502,
      date: "2025-01-20T10:00:00",
      type: "HAWB",
      shipment_id: 1002,
      planned_vessel_name: "MSC Oscar",
      voyage_no: "VOY-2025-002",
      etd: "2025-01-25T00:00:00",
      eta: "2025-02-10T00:00:00",
      actual_etd: null,
      actual_eta: null,
      arrival_port: "Singapore",
      inland_location: null,
      mbl_mawb_no: "MAWB-2025-002",
      status: "pending",
      no_pieces: 85,
      gross_weight: "1800.00",
      chargeable_weight: "1750.00",
      cbm: "16.0",
      container_seal_no: "SEAL-002",
      onboard_date: null,
      created_by: "jane.smith",
      created_on: "2025-01-20T10:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 3,
      client_name: "Tommy Hillfiguer",
      manufacture_id: null,
      date: "2025-02-05T08:00:00",
      type: "HBL",
      shipment_id: 1003,
      planned_vessel_name: "CMA CGM Marco Polo",
      voyage_no: "VOY-2025-003",
      etd: "2025-02-10T00:00:00",
      eta: "2025-02-28T00:00:00",
      actual_etd: "2025-02-10T00:00:00",
      actual_eta: null,
      arrival_port: "Port Klang",
      inland_location: "Shah Alam",
      mbl_mawb_no: "MBL-2025-003",
      status: "inactive",
      no_pieces: 200,
      gross_weight: "5100.00",
      chargeable_weight: null,
      cbm: "42.0",
      container_seal_no: null,
      onboard_date: "2025-02-10T00:00:00",
      created_by: "mike.johnson",
      created_on: "2025-02-05T08:00:00",
      updated_by: "mike.johnson",
      updated_on: "2025-02-11T09:00:00",
    },
    {
      id: 4,
      client_name: "Ralph Lauren",
      manufacture_id: 503,
      date: "2025-02-18T14:00:00",
      type: "HAWB",
      shipment_id: null,
      planned_vessel_name: null,
      voyage_no: null,
      etd: "2025-02-22T00:00:00",
      eta: "2025-03-08T00:00:00",
      actual_etd: null,
      actual_eta: null,
      arrival_port: "Dubai",
      inland_location: null,
      mbl_mawb_no: "MAWB-2025-004",
      status: "pending",
      no_pieces: null,
      gross_weight: null,
      chargeable_weight: null,
      cbm: null,
      container_seal_no: null,
      onboard_date: null,
      created_by: "sarah.connor",
      created_on: "2025-02-18T14:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 5,
      client_name: "Polo",
      manufacture_id: 504,
      date: "2025-03-01T10:00:00",
      type: "HBL",
      shipment_id: 1005,
      planned_vessel_name: "Maersk Seletar",
      voyage_no: "VOY-2025-005",
      etd: "2025-03-05T00:00:00",
      eta: "2025-03-20T00:00:00",
      actual_etd: "2025-03-05T00:00:00",
      actual_eta: "2025-03-19T00:00:00",
      arrival_port: "Shanghai",
      inland_location: "Pudong",
      mbl_mawb_no: "MBL-2025-005",
      status: "active",
      no_pieces: 310,
      gross_weight: "7800.00",
      chargeable_weight: "7600.00",
      cbm: "65.0",
      container_seal_no: "SEAL-005",
      onboard_date: "2025-03-05T00:00:00",
      created_by: "tom.harris",
      created_on: "2025-03-01T10:00:00",
      updated_by: "tom.harris",
      updated_on: "2025-03-06T08:00:00",
    },
  ]

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
        <DataTable columns={columns} data={data} searchValue={searchValue} />
      </div>
    </div>
  )
}
