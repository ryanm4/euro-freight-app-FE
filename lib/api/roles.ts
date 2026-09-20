import { getLoggedInUserIdentifier } from "@/lib/auth"

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
  created_by?: string
  updated_by?: string
}) {
  const userIdentifier = getLoggedInUserIdentifier()
  const payload = {
    ...roleData,
    created_by: roleData.created_by || userIdentifier,
    updated_by: roleData.updated_by || userIdentifier,
  }

  const res = await fetch("/api/roles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
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
  roleData: { role_name: string; description: string; updated_by?: string }
) {
  const userIdentifier = getLoggedInUserIdentifier()
  const payload = {
    ...roleData,
    updated_by: roleData.updated_by || userIdentifier,
  }

  const res = await fetch(`/api/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to update role")
  return res.json()
}
