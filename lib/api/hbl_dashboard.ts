export async function fetchHBLDashboardData() {
  const res = await fetch("/api/hbl_dashboard")
  if (!res.ok) throw new Error("Failed to fetch HBL dashboard data")
  return res.json()
}

export interface FreightCostsPayload {
  total_cost: number
  total_volume: number
}

export async function patchFreightCosts(
  id: string,
  body: FreightCostsPayload
) {
  const res = await fetch(`/api/hbl_dashboard/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error("Failed to update HBL dashboard data")
  return res.json()
}
