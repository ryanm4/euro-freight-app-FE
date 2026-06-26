export async function fetchPackingLists() {
  const res = await fetch("/api/packing_lists")
  if (!res.ok) throw new Error("Failed to fetch packing lists")
  return res.json()
}
