export async function fetchPackingLists(status?: string) {
  const url = status
    ? `/api/packing_lists?status=${encodeURIComponent(status)}`
    : "/api/packing_lists"

  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch packing lists")
  return res.json()
}

export async function fetchPackingListById(id: string) {
  const res = await fetch(`/api/packing_lists/${id}`)
  if (!res.ok) throw new Error("Failed to fetch packing list by ID")
  return res.json()
}
