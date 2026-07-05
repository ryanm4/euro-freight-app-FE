export async function fetchShipments() {
  const res = await fetch("/api/shipments")
  if (!res.ok) throw new Error("Failed to fetch shipments")
  return res.json()
}

export interface CreateShipmentPayload {
  vessel_name: string
  status: string
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
