export async function fetchGDNs() {
  const res = await fetch("/api/goods_dispatch_notes")
  if (!res.ok) throw new Error("Failed to fetch goods receive notes")
  return res.json()
}

export async function createGoodsDispatchNote(data: any) {
  const payload = {
    client_id: parseInt(data.client, 10),
    manufacture_id: parseInt(data.manufacturer, 10),
    forwarder_id: parseInt(data.forwarder, 10),
    date: data.date,
    packing_list_ids: data.selectedRows.map((r: any) => parseInt(r, 10)),
    cartoons: data.cartons,
    actual_cartoons: data.actualCartons,
    gross_weight: data.grossWeight,
    actual_gross_weight: data.actualGrossWeight,
    gross_volume: data.grossVolume,
    actual_gross_volume: data.actualGrossVolume,
    status: "Pending",
    created_by: "admin",
    gdn_grn_ref: data.gdnReference,
    vehicle_no: data.vehicleNo,
  }

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