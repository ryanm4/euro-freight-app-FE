import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import RolesForm from "../_components/roles-form"

export default function RoleCreatePage() {
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create Roles"
        breadcrumbs={[
          { title: "Dashboard", href: "/dashboard" },
          { title: "Roles", href: "/roles" },
        ]}
      />

      <div className="mt-4">
        <RolesForm />
      </div>
    </div>
  )
}
