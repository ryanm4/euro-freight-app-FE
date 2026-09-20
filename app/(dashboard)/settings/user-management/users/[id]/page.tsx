"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchUserById, fetchUsers } from "@/lib/api/users"
import { USER_LIST } from "@/modules/users/types"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"

export default function UserViewPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  // Fetch individual user if backend supports /api/users/[id], or fallback to finding from users list
  const { data: userDataResponse, isLoading, isError } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUserById(id),
  })

  const { data: allUsersResponse } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
    enabled: !userDataResponse?.data,
  })

  // Determine user object
  const user: USER_LIST | null =
    userDataResponse?.data ||
    (Array.isArray(allUsersResponse)
      ? allUsersResponse.find((u: USER_LIST) => String(u.id) === String(id))
      : Array.isArray(allUsersResponse?.data)
      ? allUsersResponse.data.find((u: USER_LIST) => String(u.id) === String(id))
      : null)

  if (isLoading && !user) return <div className="p-6">Loading user details...</div>

  return (
    <div className="mx-6 mb-6 space-y-5">
      <div className="mt-4">
        <PageTitleWithBreadcrumb
          title={user?.full_name || user?.username || "User Details"}
          breadcrumbs={[
            { title: "Dashboard", href: "/" },
            { title: "Settings", href: "/settings/user-management" },
            { title: "User Management", href: "/settings/user-management?tab=users" },
          ]}
        />
      </div>

      <div className="mx-auto space-y-5">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => router.push("/settings/user-management?tab=users")}
          >
            Back
          </Button>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              User Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Information about this user account.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="full-name"
                  className="text-xs font-medium text-foreground"
                >
                  Full Name
                </Label>
                <Input
                  id="full-name"
                  value={user?.full_name ?? "N/A"}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-medium text-foreground"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  value={user?.username ?? "N/A"}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-foreground"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={user?.email ?? "N/A"}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-medium text-foreground"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={user?.phone ?? "N/A"}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>

              {user?.created_at && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label
                    htmlFor="created-at"
                    className="text-xs font-medium text-foreground"
                  >
                    Created At
                  </Label>
                  <Input
                    id="created-at"
                    value={new Date(user.created_at).toLocaleString()}
                    className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                    disabled
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
