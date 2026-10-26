export async function fetchPackingLists(status?: string,type?: string) {
  const searchParams = new URLSearchParams()
  if (status) searchParams.set("status", status)
  if (type) searchParams.set("type", type)
  const query = searchParams.toString()
  const url = query ? `/api/packing_lists?${query}` : "/api/packing_lists"

  const res = await fetch(url)
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
