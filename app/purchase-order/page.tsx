"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { PURCHASE_ORDER } from "@/modules/purchase-order/types"
import { IconPlus } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { purchaseOrderColumns } from "./_components/purchase-order-columns"
import { DataTable } from "./_components/purchase-order-table"

export default function PurchaseOrderPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")

  const actions = {
    onEdit: (id: string) => router.push(`/purchase-order/edit/${id}`),
    onDelete: (id: string) => console.log("Delete", id),
    onView: (id: string) => router.push(`/purchase-order/view/${id}`),
    onStatusChange: (id: string, status: string) =>
      console.log("Status change", id, status),
  }

  const columns = purchaseOrderColumns(actions)

  // Empty data array for now until the API is integrated
  const data: PURCHASE_ORDER[] = [
    {
      id: 1,
      po_number: "PO-2025-001",
      po_quantity: 1000,
      ex_factory_date: "2025-01-15",
      shipping_mode: "Sea",
      final_destination: "Colombo",
      supplier_id: 201,
      freight_forwarder: 301,
      payment_mode: "LC",
      instructions: "Handle with care",
      cargo_dispatch_date: "2025-01-20T00:00:00",
      PO_url: "https://example.com/po/001",
      status: "active",
      packing_list_id: 101,
      hbl_no: "HBL-2025-001",
      dc_inhouse_date: "2025-02-10T00:00:00",
      eta_dest: "2025-02-05",
      created_by: "john.doe",
      created_on: "2025-01-10T09:00:00",
      updated_by: "john.doe",
      updated_on: "2025-01-11T10:00:00",
    },
    {
      id: 2,
      po_number: "PO-2025-002",
      po_quantity: 500,
      ex_factory_date: "2025-02-01",
      shipping_mode: "Air",
      final_destination: "Dubai",
      supplier_id: 202,
      freight_forwarder: 302,
      payment_mode: "TT",
      instructions: null,
      cargo_dispatch_date: "2025-02-05T00:00:00",
      PO_url: null,
      status: "pending",
      packing_list_id: null,
      hbl_no: null,
      dc_inhouse_date: null,
      eta_dest: "2025-02-15",
      created_by: "jane.smith",
      created_on: "2025-01-20T10:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 3,
      po_number: "PO-2025-003",
      po_quantity: 750,
      ex_factory_date: "2025-02-20",
      shipping_mode: "Sea",
      final_destination: "Singapore",
      supplier_id: 203,
      freight_forwarder: 303,
      payment_mode: "LC",
      instructions: "Fragile items",
      cargo_dispatch_date: "2025-02-25T00:00:00",
      PO_url: "https://example.com/po/003",
      status: "inactive",
      packing_list_id: 102,
      hbl_no: "HBL-2025-003",
      dc_inhouse_date: "2025-03-15T00:00:00",
      eta_dest: "2025-03-10",
      created_by: "mike.johnson",
      created_on: "2025-02-05T08:00:00",
      updated_by: "mike.johnson",
      updated_on: "2025-02-06T09:00:00",
    },
    {
      id: 4,
      po_number: "PO-2025-004",
      po_quantity: 200,
      ex_factory_date: null,
      shipping_mode: "Air",
      final_destination: "London",
      supplier_id: 204,
      freight_forwarder: 304,
      payment_mode: "TT",
      instructions: null,
      cargo_dispatch_date: null,
      PO_url: null,
      status: "pending",
      packing_list_id: null,
      hbl_no: null,
      dc_inhouse_date: null,
      eta_dest: null,
      created_by: "sarah.connor",
      created_on: "2025-02-18T14:00:00",
      updated_by: null,
      updated_on: null,
    },
    {
      id: 5,
      po_number: "PO-2025-005",
      po_quantity: 1200,
      ex_factory_date: "2025-03-01",
      shipping_mode: "Sea",
      final_destination: "Shanghai",
      supplier_id: 205,
      freight_forwarder: 305,
      payment_mode: "LC",
      instructions: "Priority shipment",
      cargo_dispatch_date: "2025-03-05T00:00:00",
      PO_url: "https://example.com/po/005",
      status: "active",
      packing_list_id: 103,
      hbl_no: "HBL-2025-005",
      dc_inhouse_date: "2025-04-01T00:00:00",
      eta_dest: "2025-03-25",
      created_by: "tom.harris",
      created_on: "2025-03-01T10:00:00",
      updated_by: "tom.harris",
      updated_on: "2025-03-02T08:00:00",
    },
  ]

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Purchase Order Management"
        breadcrumbs={[{ title: "Dashboard", href: "/dashboard" }]}
      />
      <div className="flex flex-row justify-end gap-6">
        {/* <div className="relative w-[320px]">
          <IconSearch className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="PO Number"
            className="w-full pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div> */}

        <Button onClick={() => router.push("/purchase-order/create")}>
          <IconPlus className="mr-2 h-4 w-4" /> Create New
        </Button>
      </div>

      <div className="mt-4">
        <DataTable columns={columns} data={data} searchValue={searchValue} />
      </div>
    </div>
  )
}
