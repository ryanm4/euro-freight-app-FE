"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"

import { fetchGRNs } from "@/lib/api/goods_receive_notes"
import { fetchShipmentById, updateShipment } from "@/lib/api/shipments"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { SHIPMENT } from "@/modules/shipment/types"
import GRNTable from "../../_components/GRNTable"

type Mode = "" | "AIR" | "SEA"

const inferMode = (shipment: SHIPMENT): Mode => {
  if (shipment.flight_number || shipment.origin || shipment.destination) {
    return "AIR"
  }
  if (
    shipment.vessel_name ||
    shipment.origin_port ||
    shipment.discharge_port ||
    shipment.container_number
  ) {
    return "SEA"
  }
  return ""
}

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

  const [mode, setMode] = useState<Mode>("")
  const [isPending, setIsPending] = useState(false)
  const [selectedGRNIds, setSelectedGRNIds] = useState<Set<number>>(new Set())

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
  })

  // Populate form when API data is loaded
  useEffect(() => {
    if (res?.data) {
      const shipment = res.data as SHIPMENT

      setMode(inferMode(shipment))

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
      })

      const linkedIds = [
        ...((shipment as any).grns ?? []),
        ...((shipment as any).grn_details ?? []),
        ...((shipment as any).hbls ?? []),
      ].map((grn: any) => Number(grn.id))
      const existingIds = [
        ...linkedIds,
        ...((shipment as any).grn_ids ?? []).map((gId: number) => Number(gId)),
        ...((shipment as any).hbl_ids ?? []).map((hId: number) => Number(hId)),
      ].filter((gId, index, ids) => Number.isFinite(gId) && ids.indexOf(gId) === index)

      setSelectedGRNIds(new Set(existingIds))
    }
  }, [res?.data])

  // Fetch GRNs for the currently selected mode
  const { data: grnsRes } = useQuery({
    queryKey: ["goods_receive_notes", mode],
    queryFn: () => fetchGRNs(undefined, mode),
    enabled: !!mode,
  })

  const allGRNs = useMemo(() => {
    return Array.isArray(grnsRes)
      ? grnsRes
      : Array.isArray(grnsRes?.data)
        ? grnsRes.data
        : []
  }, [grnsRes])

  const linkedGRNs = useMemo(() => {
    const shipment = res?.data as any
    const rawLinked = (shipment?.grns ?? shipment?.grn_details ?? shipment?.hbls ?? []) as any[]
    return rawLinked.map((item: any) => {
      const fullGRN = allGRNs.find((g: any) => Number(g.id) === Number(item.id))
      return fullGRN ? { ...item, ...fullGRN } : item
    })
  }, [res?.data, allGRNs])

  const availableGRNs = useMemo(() => {
    return allGRNs.filter((grn: any) => {
      if (!mode) return false
      const statusLower = grn.status?.toLowerCase()
      if (statusLower !== "completed") return false

      const packingLists = grn.packing_lists ?? []
      if (packingLists.length === 0) return true

      if (mode === "AIR") {
        return packingLists.some(
          (pl: any) => pl.shipping_mode?.toUpperCase() === "AIR"
        )
      }

      if (mode === "SEA") {
        return packingLists.some((pl: any) => {
          const sm = pl.shipping_mode?.toUpperCase()
          return sm === "SEA" || sm === "LCL" || sm === "FCL"
        })
      }

      return true
    })
  }, [allGRNs, mode])

  const grns = useMemo(() => {
    const merged = [...linkedGRNs]
    availableGRNs.forEach((grn: any) => {
      if (!merged.some((linkedGrn: any) => Number(linkedGrn.id) === Number(grn.id))) {
        merged.push(grn)
      }
    })
    return merged
  }, [linkedGRNs, availableGRNs])

  // Auto-fill destination and final_place_of_delivery from selected GRN ship_to
  useEffect(() => {
    if (selectedGRNIds.size === 0) {
      return
    }

    const selectedGrns = grns.filter((g: any) => selectedGRNIds.has(g.id))
    const shipTos: string[] = []
    selectedGrns.forEach((g: any) => {
      (g.packing_lists ?? []).forEach((pl: any) => {
        if (pl.ship_to && !shipTos.includes(pl.ship_to)) {
          shipTos.push(pl.ship_to)
        }
      })
    })

    if (shipTos.length > 0) {
      const autoDestination = shipTos.join(", ")
      setFormData((prev) => ({
        ...prev,
        destination: autoDestination,
        final_place_of_delivery: autoDestination,
      }))
    }
  }, [selectedGRNIds, grns])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleModeChange = (v: Mode) => {
    setMode(v)
    setSelectedGRNIds(new Set())
  }

  const toggleGrnRow = (id: number) => {
    setSelectedGRNIds((prev) => {
      // Allow unselecting
      if (prev.has(id)) {
        const next = new Set(prev)
        next.delete(id)
        return next
      }

      // Check existing selected GRNs' ship_to places
      const selectedGrns = grns.filter((g: any) => prev.has(g.id))
      const activeShipTos: string[] = []
      selectedGrns.forEach((g: any) => {
        (g.packing_lists ?? []).forEach((pl: any) => {
          if (
            pl.ship_to &&
            pl.ship_to.trim() &&
            !activeShipTos.includes(pl.ship_to.trim())
          ) {
            activeShipTos.push(pl.ship_to.trim())
          }
        })
      })

      if (activeShipTos.length > 0) {
        const candidateGrn = grns.find((g: any) => g.id === id)
        const candidateShipTos: string[] = []
        ;(candidateGrn?.packing_lists ?? []).forEach((pl: any) => {
          if (
            pl.ship_to &&
            pl.ship_to.trim() &&
            !candidateShipTos.includes(pl.ship_to.trim())
          ) {
            candidateShipTos.push(pl.ship_to.trim())
          }
        })

        const isMatch = candidateShipTos.some((st) =>
          activeShipTos.some((ast) => ast.toLowerCase() === st.toLowerCase())
        )

        if (!isMatch) {
          toast.error(
            `Cannot select GRN #${id}: Ship To place (${
              candidateShipTos.join(", ") || "N/A"
            }) does not match selected GRN Ship To (${activeShipTos.join(
              ", "
            )}).`
          )
          return prev
        }
      }

      return new Set([...prev, id])
    })
  }

  const handleSave = async () => {
    if (!res?.data) return
    setIsPending(true)
    try {
      const selectedIds = Array.from(selectedGRNIds)
      const basePayload = {
        created_by: (res.data as SHIPMENT & { created_by: string }).created_by,
        status: formData.status || "",
        mbl_mawb_no: formData.mbl_mawb_no || null,
        airline_shipping_line: formData.airline_shipping_line || null,
        grn_ids: selectedIds,
        hbl_ids: selectedIds,
      }

      const payload =
        mode === "AIR"
          ? {
            ...basePayload,
            vessel_name: null,
            voyage_number: null,
            origin_port: null,
            discharge_port: null,
            final_place_of_delivery: null,
            etd_colombo: null,
            eta_discharge_port: null,
            eta_final_delivery_place: null,
            container_number: null,
            container_size: null,
            final_seal_no: null,
            flight_number: formData.flight_number || null,
            origin: formData.origin || null,
            destination: formData.destination || null,
            etd_origin: formData.etd_origin || null,
            eta_destination: formData.eta_destination || null,
          }
          : {
            ...basePayload,
            vessel_name: formData.vessel_name || null,
            voyage_number: formData.voyage_number || null,
            origin_port: formData.origin_port || null,
            discharge_port: formData.discharge_port || null,
            final_place_of_delivery: formData.final_place_of_delivery || null,
            etd_colombo: formData.etd_colombo || null,
            eta_discharge_port: formData.eta_discharge_port || null,
            eta_final_delivery_place:
              formData.eta_final_delivery_place || null,
            container_number: formData.container_number || null,
            container_size: formData.container_size || null,
            final_seal_no: formData.final_seal_no || null,
            flight_number: null,
            origin: null,
            destination: null,
            etd_origin: null,
            eta_destination: null,
          }

      await updateShipment(id, payload)
      router.push(`/shipment`)
    } catch (error) {
      console.error("Failed to update shipment:", error)
    } finally {
      setIsPending(false)
    }
  }

  const handleCancel = () => {
    router.push(`/shipment`)
  }

  if (isLoading) {
    return <div>Loading…</div>
  }

  if (isError || !res?.data) {
    return (
      <div className="p-6 text-red-500">
        Error loading shipment details. Please try again.
      </div>
    )
  }

  const inputClass =
    "h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title={`Edit Shipment #${id}`}
        breadcrumbs={[
          { title: "Dashboard", href: "/" },
          { title: "Shipment", href: "/shipment" },
        ]}
      />

      <div className="mx-auto space-y-5 w-full">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={isPending || !mode}
            onClick={handleSave}
          >
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                Shipment Details
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Choose a mode to reveal the relevant fields
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="mode"
                    className="text-xs font-medium text-foreground"
                  >
                    Mode
                  </Label>
                  <Select value={mode} onValueChange={handleModeChange}>
                    <SelectTrigger
                      id="mode"
                      className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500"
                    >
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-[#0A0A0A] text-zinc-100">
                      <SelectItem value="SEA">Sea</SelectItem>
                      <SelectItem value="AIR">Air</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="status"
                    className="text-xs font-medium text-foreground"
                  >
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => handleChange("status", val)}
                  >
                    <SelectTrigger
                      id="status"
                      className="h-9 w-full rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 focus:ring-1 focus:ring-zinc-500"
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="border-zinc-700 bg-[#0A0A0A] text-zinc-100">
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="departure">Departure</SelectItem>
                      <SelectItem value="in transit">In Transit</SelectItem>
                      <SelectItem value="arrived">Arrived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="mbl-mawb-no"
                    className="text-xs font-medium text-foreground"
                  >
                    MBL / MAWB No
                  </Label>
                  <Input
                    id="mbl-mawb-no"
                    placeholder="Enter MBL / MAWB No"
                    value={formData.mbl_mawb_no}
                    onChange={(e) =>
                      handleChange("mbl_mawb_no", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {mode === "AIR" && (
            <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Air Information
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Flight and routing details
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="airline"
                    className="text-xs font-medium text-foreground"
                  >
                    Airline
                  </Label>
                  <Input
                    id="airline"
                    placeholder="Enter Airline"
                    value={formData.airline_shipping_line}
                    onChange={(e) =>
                      handleChange("airline_shipping_line", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="flight-number"
                    className="text-xs font-medium text-foreground"
                  >
                    Flight Number
                  </Label>
                  <Input
                    id="flight-number"
                    placeholder="Enter Flight Number"
                    value={formData.flight_number}
                    onChange={(e) =>
                      handleChange("flight_number", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="origin"
                    className="text-xs font-medium text-foreground"
                  >
                    Origin
                  </Label>
                  <Input
                    id="origin"
                    placeholder="Enter Origin"
                    value={formData.origin}
                    onChange={(e) => handleChange("origin", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="destination"
                    className="text-xs font-medium text-foreground"
                  >
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="Destination"
                    value={formData.destination}
                    className={`${inputClass} cursor-not-allowed font-medium text-zinc-100 opacity-100 bg-[#0A0A0A] border-zinc-700`}
                    readOnly
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="etd-origin"
                    className="text-xs font-medium text-foreground"
                  >
                    ETD Origin
                  </Label>
                  <Input
                    id="etd-origin"
                    type="date"
                    value={formData.etd_origin}
                    onChange={(e) => handleChange("etd_origin", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="eta-destination"
                    className="text-xs font-medium text-foreground"
                  >
                    ETA Destination
                  </Label>
                  <Input
                    id="eta-destination"
                    type="date"
                    value={formData.eta_destination}
                    onChange={(e) =>
                      handleChange("eta_destination", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {mode === "SEA" && (
            <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-zinc-100">
                  Vessel Information
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Vessel, container and routing details
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="shipping-line"
                    className="text-xs font-medium text-foreground"
                  >
                    Shipping Line
                  </Label>
                  <Input
                    id="shipping-line"
                    placeholder="Enter Shipping Line"
                    value={formData.airline_shipping_line}
                    onChange={(e) =>
                      handleChange("airline_shipping_line", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="vessel-name"
                    className="text-xs font-medium text-foreground"
                  >
                    Vessel Name
                  </Label>
                  <Input
                    id="vessel-name"
                    placeholder="Enter Vessel Name"
                    value={formData.vessel_name}
                    onChange={(e) =>
                      handleChange("vessel_name", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="voyage-number"
                    className="text-xs font-medium text-foreground"
                  >
                    Voyage Number
                  </Label>
                  <Input
                    id="voyage-number"
                    placeholder="Enter Voyage Number"
                    value={formData.voyage_number}
                    onChange={(e) =>
                      handleChange("voyage_number", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="origin-port"
                    className="text-xs font-medium text-foreground"
                  >
                    Origin Port
                  </Label>
                  <Input
                    id="origin-port"
                    placeholder="Enter Origin Port"
                    value={formData.origin_port}
                    onChange={(e) =>
                      handleChange("origin_port", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="discharge-port"
                    className="text-xs font-medium text-foreground"
                  >
                    Discharge Port
                  </Label>
                  <Input
                    id="discharge-port"
                    placeholder="Enter Discharge Port"
                    value={formData.discharge_port}
                    onChange={(e) =>
                      handleChange("discharge_port", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="final-place-of-delivery"
                    className="text-xs font-medium text-foreground"
                  >
                    Final Place of Delivery
                  </Label>
                  <Input
                    id="final-place-of-delivery"
                    placeholder="Destination"
                    value={formData.final_place_of_delivery}
                    className={`${inputClass} cursor-not-allowed font-medium text-zinc-100 opacity-100 bg-[#0A0A0A] border-zinc-700`}
                    readOnly
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="etd-colombo"
                    className="text-xs font-medium text-foreground"
                  >
                    ETD Colombo
                  </Label>
                  <Input
                    id="etd-colombo"
                    type="date"
                    value={formData.etd_colombo}
                    onChange={(e) =>
                      handleChange("etd_colombo", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="eta-discharge-port"
                    className="text-xs font-medium text-foreground"
                  >
                    ETA Discharge Port
                  </Label>
                  <Input
                    id="eta-discharge-port"
                    type="date"
                    value={formData.eta_discharge_port}
                    onChange={(e) =>
                      handleChange("eta_discharge_port", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="eta-final-delivery-place"
                    className="text-xs font-medium text-foreground"
                  >
                    ETA Final Delivery Place
                  </Label>
                  <Input
                    id="eta-final-delivery-place"
                    type="date"
                    value={formData.eta_final_delivery_place}
                    onChange={(e) =>
                      handleChange("eta_final_delivery_place", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="container-number"
                    className="text-xs font-medium text-foreground"
                  >
                    Container Number
                  </Label>
                  <Input
                    id="container-number"
                    placeholder="Enter Container Number"
                    value={formData.container_number}
                    onChange={(e) =>
                      handleChange("container_number", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="container-size"
                    className="text-xs font-medium text-foreground"
                  >
                    Container Size
                  </Label>
                  <Input
                    id="container-size"
                    placeholder="e.g. 40HC"
                    value={formData.container_size}
                    onChange={(e) =>
                      handleChange("container_size", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="final-seal-no"
                    className="text-xs font-medium text-foreground"
                  >
                    Final Seal No
                  </Label>
                  <Input
                    id="final-seal-no"
                    placeholder="Enter Final Seal No"
                    value={formData.final_seal_no}
                    onChange={(e) =>
                      handleChange("final_seal_no", e.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-zinc-100">
                GRN Information
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Select GRN records to associate with this shipment
              </p>
            </div>

            {!mode ? (
              <p className="text-xs text-zinc-500">
                Select a mode to load GRN records.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-neutral-700">
                <GRNTable
                  grns={grns}
                  selectedIds={selectedGRNIds}
                  onToggle={toggleGrnRow}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}