export async function fetchWharfStaff() {
  const res = await fetch("/api/wharf-staff")
  if (!res.ok) throw new Error("Failed to fetch wharf staff")
  return res.json()
}
