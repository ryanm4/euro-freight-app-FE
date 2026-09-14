"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { fetchGroupById, updateGroup } from "@/lib/api/groups"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function GroupEdit() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["group", id],
    queryFn: () => fetchGroupById(id),
  })

  const [groupName, setGroupName] = useState("")
  const [description, setDescription] = useState("")
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    if (data?.data) {
      setGroupName(data.data.group_name ?? "")
      setDescription(data.data.description ?? "")
    }
  }, [data])

  const onSaveClick = async () => {
    setIsPending(true)
    if (!groupName.trim()) {
      toast.error("Group name is required")
      setIsPending(false)
      return
    }

    try {
      await updateGroup(id, {
        group_name: groupName,
        description,
      })
      toast.success("Group updated successfully")

      queryClient.invalidateQueries({ queryKey: ["groups"] })
      router.push(`/groups`)
    } catch (error) {
      console.error(error)
      toast.error("Failed to update group")
    } finally {
      setIsPending(false)
    }
  }

  if (isLoading) return <div>Loading…</div>
  if (isError || !data?.data) return <>Not found</>

  return (
    <div className="mx-6 mb-6 space-y-5">
      <div className="mt-4">
        <PageTitleWithBreadcrumb
          title={`Edit ${data?.data?.group_name ?? ""}`}
          breadcrumbs={[
            { title: "Dashboard", href: "/dashboard" },
            { title: "Groups", href: "/groups" },
          ]}
        />
      </div>

      <div className="mx-auto space-y-5">
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => router.push(`/groups/${id}`)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="rounded-md"
            onClick={onSaveClick}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>

        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">
              Group Details
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Provide the group details below.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="group-name"
                  className="text-xs font-medium text-foreground"
                >
                  Group Name
                </Label>
                <Input
                  id="group-name"
                  placeholder="Enter Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-9 rounded-md border-zinc-700 bg-[#0A0A0A] text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
