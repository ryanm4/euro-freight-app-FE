export async function fetchRoles(status?: string) {
  const url = status
    ? `/api/roles?status=${encodeURIComponent(status)}`
    : "/api/roles"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch roles")
  return res.json()
}

export async function createRole(roleData: {
  role_name: string
  description: string
}) {
  const res = await fetch("/api/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  })
  if (!res.ok) throw new Error("Failed to create role")
  return res.json()
}

export async function fetchRoleById(id: string) {
  const res = await fetch(`/api/roles/${id}`)
  if (!res.ok) throw new Error("Failed to fetch role by ID")
  return res.json()
}

export async function updateRole(
  id: string,
  roleData: { role_name: string; description: string }
) {
  const res = await fetch(`/api/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(roleData),
  })
  if (!res.ok) throw new Error("Failed to update role")
  return res.json()
}
