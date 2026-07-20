export interface CreateGoodsDispatchNotePayload {
  client_id: number
  manufacture_id: number
  forwarder_id: number
  date: string
  packing_list_ids: number[]
  cartoons: string
  actual_cartoons?: string
  gross_weight: string
  actual_gross_weight: string
  gross_volume: string
  actual_gross_volume: string
  status: string
  created_by: string
  gdn_grn_ref: string
  vehicle_no: string
  driver_id: number
  dispatch_location: string
  transport_mode: string
  container_no?: string
  container_size?: string
  primary_seal_no?: string
  secondary_seal_no?: string
  custom_doc_status: string
  wharf_staff_id: number
  driver_contact_no: string
  wharf_contact_no: string
}

export async function fetchGDNs() {
  const res = await fetch("/api/goods_dispatch_notes")
  if (!res.ok) throw new Error("Failed to fetch goods receive notes")
  return res.json()
}

export async function createGoodsDispatchNote(
  payload: CreateGoodsDispatchNotePayload
) {
  const res = await fetch("/api/goods_dispatch_notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error("Failed to create goods dispatch note")
  return res.json()
}

export async function fetchGoodsDispatchNoteById(id: string) {
  const res = await fetch(`/api/goods_dispatch_notes/${id}`)
  if (!res.ok) throw new Error("Failed to fetch goods dispatch note by ID")
  return res.json()
}
