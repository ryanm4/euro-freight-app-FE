import { getLoggedInUserIdentifier } from "@/lib/auth"

export async function fetchGroups(status?: string) {
  const url = status
    ? `/api/groups?status=${encodeURIComponent(status)}`
    : "/api/groups"
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to fetch groups")
  return res.json()
}

export async function createGroup(groupData: {
  group_name: string
  description: string
  created_by?: string
  updated_by?: string
}) {
  const userIdentifier = getLoggedInUserIdentifier()
  const payload = {
    ...groupData,
    created_by: groupData.created_by || userIdentifier,
    updated_by: groupData.updated_by || userIdentifier,
  }

  const res = await fetch("/api/groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to create group")
  return res.json()
}

export async function fetchGroupById(id: string) {
  const res = await fetch(`/api/groups/${id}`)
  if (!res.ok) throw new Error("Failed to fetch group by ID")
  return res.json()
}

export async function updateGroup(
  id: string,
  groupData: { group_name: string; description: string; updated_by?: string }
) {
  const userIdentifier = getLoggedInUserIdentifier()
  const payload = {
    ...groupData,
    updated_by: groupData.updated_by || userIdentifier,
  }

  const res = await fetch(`/api/groups/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("Failed to update group")
  return res.json()
}
