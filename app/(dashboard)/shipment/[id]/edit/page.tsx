"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"

import { fetchShipmentById, updateShipment } from "@/lib/api/shipments"

import { SHIPMENT } from "@/modules/shipment/types"

export default function ShipmentEdit() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const {
    data: res,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => fetchShipmentById(id),
    enabled: !!id,
  })

  const [formData, setFormData] = useState({
    vessel_name: "",
    status: "",
    voyage_number: "",
    origin_port: "",
    discharge_port: "",
    final_place_of_delivery: "",
    etd_colombo: "",
    eta_discharge_port: "",
    eta_final_delivery_place: "",
    flight_number: "",
    origin: "",
    destination: "",
    etd_origin: "",
    eta_destination: "",
    mbl_mawb_no: "",
    airline_shipping_line: "",
    container_number: "",
    container_size: "",
    final_seal_no: "",
    hbl_ids: [] as number[],
  })

  const [isPending, setIsPending] = useState(false)

  /**
   * Populate form when API data is loaded
   */
  useEffect(() => {
    if (res?.data) {
      const shipment = res.data as SHIPMENT

      setFormData({
        vessel_name: shipment.vessel_name ?? "",
        status: shipment.status ?? "",
        voyage_number: shipment.voyage_number ?? "",
        origin_port: shipment.origin_port ?? "",
        discharge_port: shipment.discharge_port ?? "",
        final_place_of_delivery: shipment.final_place_of_delivery ?? "",

        etd_colombo: shipment.etd_colombo
          ? String(shipment.etd_colombo).slice(0, 10)
          : "",

        eta_discharge_port: shipment.eta_discharge_port
          ? String(shipment.eta_discharge_port).slice(0, 10)
          : "",

        eta_final_delivery_place: shipment.eta_final_delivery_place
          ? String(shipment.eta_final_delivery_place).slice(0, 10)
          : "",

        flight_number: shipment.flight_number ?? "",
        origin: shipment.origin ?? "",
        destination: shipment.destination ?? "",

        etd_origin: shipment.etd_origin
          ? String(shipment.etd_origin).slice(0, 10)
          : "",

        eta_destination: shipment.eta_destination
          ? String(shipment.eta_destination).slice(0, 10)
          : "",

        mbl_mawb_no: shipment.mbl_mawb_no ?? "",
        airline_shipping_line: shipment.airline_shipping_line ?? "",

        container_number: shipment.container_number ?? "",

        container_size: shipment.container_size ?? "",

        final_seal_no: shipment.final_seal_no ?? "",

        hbl_ids: shipment.hbl_ids ?? [],
      })
    }
  }, [res?.data])

  /**
   * Handle input changes
   */
  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  /**
   * Save shipment
   */
  const handleSave = async () => {
    try {
      setIsPending(true)

      const payload = {
        created_by: (res.data as SHIPMENT & { created_by: number }).created_by,
        vessel_name: formData.vessel_name || null,
        status: formData.status || "",
        voyage_number: formData.voyage_number || null,

        origin_port: formData.origin_port || null,
        discharge_port: formData.discharge_port || null,
        final_place_of_delivery: formData.final_place_of_delivery || null,

        etd_colombo: formData.etd_colombo || null,
        eta_discharge_port: formData.eta_discharge_port || null,
        eta_final_delivery_place: formData.eta_final_delivery_place || null,

        flight_number: formData.flight_number || null,
        origin: formData.origin || null,
        destination: formData.destination || null,

        etd_origin: formData.etd_origin || null,
        eta_destination: formData.eta_destination || null,

        mbl_mawb_no: formData.mbl_mawb_no || null,

        airline_shipping_line: formData.airline_shipping_line || null,

        container_number: formData.container_number || null,

        container_size: formData.container_size || null,

        final_seal_no: formData.final_seal_no || null,

        hbl_ids: formData.hbl_ids,
      }

      console.log("Update shipment payload:", payload)

      await updateShipment(id, payload)

      router.push(`/shipments/${id}`)
    } catch (error) {
      console.error("Failed to update shipment:", error)
    } finally {
      setIsPending(false)
    }
  }

  /**
   * Cancel editing
   */
  const handleCancel = () => {
    router.push(`/shipments/${id}`)
  }

  if (isLoading) {
    return <div>Loading…</div>
  }

  if (isError || !res?.data) {
    return <>Not found</>
  }

  return (
    <div className="mx-6 mb-6 space-y-5">
      {/* Page Header */}
      <div className="mt-4">
        <PageTitleWithBreadcrumb
          title="Edit Shipment"
          breadcrumbs={[
            {
              title: "Dashboard",
              href: "/dashboard",
            },
            {
              title: "Shipments",
              href: "/shipments",
            },
            {
              title: "Edit Shipment",
              href: `/shipments/${id}/edit`,
            },
          ]}
        />
      </div>

      {/* Top Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          onClick={handleCancel}
          disabled={isPending}
        >
          Cancel
        </Button>

        <Button
          type="button"
          className="rounded-md"
          onClick={handleSave}
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}
