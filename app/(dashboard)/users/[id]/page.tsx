import { redirect } from "next/navigation"

export default async function UserViewRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/settings/user-management/users/${id}`)
}
