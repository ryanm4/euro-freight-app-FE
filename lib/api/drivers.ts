export async function fetchDrivers() {
  const res = await fetch("/api/drivers")
  if (!res.ok) throw new Error("Failed to fetch drivers")
  return res.json()
}
