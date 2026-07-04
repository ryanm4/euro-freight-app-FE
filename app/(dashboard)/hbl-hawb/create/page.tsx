"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
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
        ]}
      />

      <div className="mt-4">
        <HBLHABWForm />
      </div>
    </div>
  )
}
