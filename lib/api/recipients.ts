export async function fetchRecipients() {
  const res = await fetch("/api/recipients")
  if (!res.ok) throw new Error("Failed to fetch recipients")
  return res.json()
}
