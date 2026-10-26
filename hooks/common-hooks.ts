import { getUser } from "@/lib/auth"

export type UserType = "sea" | "air" | "admin"

export function isClientUser(): boolean {
  const groups: unknown = getUser()?.groups
  return (
    Array.isArray(groups) &&
    groups.some(
      (group: unknown) =>
        typeof group === "object" &&
        group !== null &&
        "group_name" in group &&
        typeof group.group_name === "string" &&
        group.group_name.trim().toLowerCase() === "client"
    )
  )
}

export function getUserType(): UserType | undefined {
  const groups: unknown = getUser()?.groups
  if (!Array.isArray(groups)) return undefined

  const groupNames = groups.flatMap((group: unknown) => {
    if (typeof group !== "object" || group === null || !("group_name" in group)) {
      return []
    }

    const groupName = group.group_name
    return typeof groupName === "string" ? [groupName.trim().toLowerCase()] : []
  })

  const hasAdminGroup = groupNames.includes("admin")
  const hasSeaShipping = groupNames.includes("sea shipping")
  const hasAirShipping = groupNames.includes("air shipping")

  if (hasAdminGroup || (hasSeaShipping && hasAirShipping)) return "admin"
  if (hasSeaShipping) return "sea"
  if (hasAirShipping) return "air"
  return undefined
}
