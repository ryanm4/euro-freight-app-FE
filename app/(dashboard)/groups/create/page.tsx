import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import GroupForm from "../_components/groups-form"

export default function GroupCreatePage() {
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Groups"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Groups", href: "/groups" },
        ]}
      />

      <div className="mt-4">
        <GroupForm />
      </div>
    </div>
  )
}
