import { redirect } from "next/navigation"

export default function GroupsPage() {
  redirect("/settings/user-management?tab=groups")
}
