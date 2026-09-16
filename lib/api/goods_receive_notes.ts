export async function fetchGRNs(status?: string, mode?: string) {
  const params = new URLSearchParams()
  if (status) params.set("status", status)
  if (mode) params.set("mode", mode)

  const qs = params.toString()
  const url = qs ? `/api/goods_receive_notes?${qs}` : "/api/goods_receive_notes"

  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch goods receive notes")
  return res.json()
}

export async function createGoodsReceiveNote(data: any) {
  debugger
  const payload = {
    client_id: parseInt(data.client_id),
    manufacture_id: parseInt(data.manufacture_id),
    forwarder_id: parseInt(data.forwarder_id),
    recipient_id: parseInt(data.recipient_id),
    recipient_contact: data.recipient_contact,
    date: data.date,
    quantity: parseInt(data.quantity),
    status: data.status,
    created_by: "admin",
    gdn_id: parseInt(data.gdn_id),
    measurements: data.measurements.map((m: any) => ({
      length_cm: m.length_cm,
      width_cm: m.width_cm,
      height_cm: m.height_cm,
      packages: m.packages,
      total: m.total,
      uom: m.uom,
      cbm: m.cbm,
      volume: m.volume,
    })),
  }

  const res = await fetch("/api/goods_receive_notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error("Failed to create goods receive note")
  return res.json()
}

export async function fetchGoodsReceiveNoteById(id: string) {
  const res = await fetch(`/api/goods_receive_notes/${id}`)
  if (!res.ok) throw new Error("Failed to fetch goods receive note by ID")
  return res.json()
}

export async function updateGoodsReceiveNote(id: string, data: any) {
  const payload = {
    client_id: parseInt(data.client),
    manufacture_id: parseInt(data.manufacturer),
    forwarder_id: parseInt(data.forwarder),
    date: data.date,
    quantity: parseInt(data.quantity),
    status: data.status,
    updated_by: "admin",
    packing_list_ids: data.selectedRows.map((r: any) => parseInt(r)),
  }

  const res = await fetch(`/api/goods_receive_notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error("Failed to update goods receive note")
  return res.json()
}
