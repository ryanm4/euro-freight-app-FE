export async function fetchPackingLists() {
  const res = await fetch("/api/packing_lists")
  if (!res.ok) throw new Error("Failed to fetch packing lists")
  return res.json()
}

export async function fetchPackingListById(id: string) {
  const res = await fetch(`/api/packing_lists/${id}`)
  if (!res.ok) throw new Error("Failed to fetch packing list by ID")
  return res.json()
}

export async function updatePackingList(id: string, body: object) {
  const res = await fetch(`/api/packing_lists/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to update packing list")
  return res.json()
}

export async function UploadPackingList(data: FormData) {
  const res = await fetch("/api/packing_lists/upload", {
    method: "POST",
    body: data,
  })
  if (!res.ok) throw new Error("Failed to upload packing list")
  return res.json()
}
