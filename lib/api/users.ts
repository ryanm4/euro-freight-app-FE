export async function fetchUsers(status?: string) {
  const url = status
    ? `/api/users?status=${encodeURIComponent(status)}`
    : "/api/users"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}