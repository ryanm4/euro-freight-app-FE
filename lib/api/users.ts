import { getLoggedInUserIdentifier } from "@/lib/auth"
import { USER_CREATE_PAYLOAD } from "@/modules/users/types"

export async function fetchUsers() {
  const res = await fetch("/api/users")
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function fetchUserById(id: string) {
  const res = await fetch(`/api/users/${id}`)
  if (!res.ok) throw new Error("Failed to fetch user by ID")
  return res.json()
}

export async function createUser(userData: USER_CREATE_PAYLOAD) {
  const userIdentifier = getLoggedInUserIdentifier()
  const payload = {
    ...userData,
    created_by: userData.created_by || userIdentifier,
    updated_by: userData.updated_by || userIdentifier,
  }

  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create user")
  return res.json()
}
