export async function fetchHBLHAWBs() {
  const res = await fetch("/api/hbl_hawbs")
  if (!res.ok) throw new Error("Failed to fetch HBL/HAWBs")
  return res.json()
}
