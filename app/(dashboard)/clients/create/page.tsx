"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import ClientForm from "../_components/client-form"

export default function ClientCreatePage() {
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Client"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Clients", href: "/clients" },
        ]}
      />

      <div className="mt-4">
        <ClientForm />
      </div>
    </div>
  )
}
