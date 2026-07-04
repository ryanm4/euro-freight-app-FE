export async function fetchShipments() {
  const res = await fetch("/api/shipments")
  if (!res.ok) throw new Error("Failed to fetch shipments")
  return res.json()
}
