export async function fetchGRNs() {
  const res = await fetch("/api/goods_receive_notes")
  if (!res.ok) throw new Error("Failed to fetch goods receive notes")
  return res.json()
}

export async function createGoodsReceiveNote(data: any) {
  debugger
  const payload = {
    client_id: parseInt(data.client),
    manufacture_id: parseInt(data.manufacturer),
    forwarder_id: parseInt(data.forwarder),
    date: data.date,
    quantity: parseInt(data.quantity),
    status: "Pending",
    created_by: "admin",
    packing_list_ids: data.selectedRows.map((r: any) => parseInt(r)),
  }

  const res = await fetch("/api/goods_receive_notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error("Failed to create goods receive note")
  return res.json()
}
