"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchRoleById } from "@/lib/api/roles"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"

export default function RoleByID() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useQuery({
    queryKey: ["role", id],
    queryFn: () => fetchRoleById(id),
  })

  if (isLoading) return <div>Loading…</div>
  if (isError || !data?.data) return <>Not found</>

  const roleData = data.data

  const onEditClick = () => {
    router.push(`/roles/${id}/edit`)
  }

  return (
    <div className="mx-6 mb-6 space-y-5">
      <div className="mt-4">
        <PageTitleWithBreadcrumb
          title={`${data?.role_name ?? ""}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Roles", href: "/roles" },
          ]}
        />
      </div>

      <div className="mx-auto space-y-5">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => router.push("/roles")}
          >
            Back
          </Button>
          <Button className="rounded-md" onClick={onEditClick}>
            Edit
          </Button>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Role Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Provide the role details below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="role-name"
                  className="text-xs font-medium text-foreground"
                >
                  Role Name
                </Label>
                <Input
                  id="role-name"
                  placeholder="Enter Role Name"
                  value={roleData?.role_name ?? ""}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="description"
                  className="text-xs font-medium text-foreground"
                >
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Enter Description"
                  value={roleData?.description ?? ""}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
