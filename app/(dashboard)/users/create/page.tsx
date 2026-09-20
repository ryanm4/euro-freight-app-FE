import { redirect } from "next/navigation"

export default function UsersCreateRedirectPage() {
  redirect("/settings/user-management/users/create")
}
