"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import HBLHABWForm from "../_components/hbl-hawb-form"

export default function HBLHAWBCreatePage() {
  const router = useRouter()
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="HBL/HAWB Creation"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "HBL / HAWB", href: "/hbl-hawb" },
          { title: "Add", href: "/hbl-hawb/create" },
        ]}
      />

      <div className="flex flex-row justify-end gap-6">
        <Button
          variant={"outline"}
          className="rounded-md"
          onClick={() => router.push("/hbl-hawb")}
        >
          Cancel
        </Button>
        <Button className="rounded-md" onClick={() => router.push("/hbl-hawb")}>
          Save
        </Button>
      </div>

      <div className="mt-4">
        <HBLHABWForm />
      </div>
    </div>
  )
}
