export async function fetchShipments() {
  const res = await fetch("/api/shipments")
  if (!res.ok) throw new Error("Failed to fetch shipments")
  return res.json()
}

export async function fetchShipmentById(id: string) {
  const res = await fetch(`/api/shipments/${id}`)
  if (!res.ok) throw new Error("Failed to fetch shipment by ID")
  return res.json()
}

export interface CreateShipmentPayload {
  vessel_name: string | null
  status: string
  voyage_number: string | null
  origin_port: string | null
  discharge_port: string | null
  final_place_of_delivery: string | null
  etd_colombo: string | null
  eta_discharge_port: string | null
  eta_final_delivery_place: string | null
  flight_number: string | null
  origin: string | null
  destination: string | null
  etd_origin: string | null
  eta_destination: string | null
  mbl_mawb_no: string | null
  airline_shipping_line: string | null
  container_number: string | null
  container_size: string | null
  final_seal_no: string | null
  created_by: string
  hbl_ids: number[]
}

export async function createShipment(payload: CreateShipmentPayload) {
  const res = await fetch("/api/shipments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error?.message ?? "Failed to create shipment")
  }

  return res.json()
}

export async function updateShipment(
  id: string,
  payload: {
    vessel_name: string | null
    status: string | null
    voyage_number: string | null
    origin_port: string | null
    discharge_port: string | null
    final_place_of_delivery: string | null
    etd_colombo: string | null
    eta_discharge_port: string | null
    eta_final_delivery_place: string | null
    flight_number: string | null
    origin: string | null
    destination: string | null
    etd_origin: string | null
    eta_destination: string | null
    mbl_mawb_no: string | null
    airline_shipping_line: string | null
    container_number: string | null
    container_size: string | null
    final_seal_no: string | null
    hbl_ids: number[]
  }
) {
  const res = await fetch(`/api/shipments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)

    throw new Error(errorData?.error || "Failed to update shipment")
  }

  return res.json()
}