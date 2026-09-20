import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import UsersForm from "../../_components/users-form"

export default function UserCreatePage() {
  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="Create User"
        breadcrumbs={[
          { title: "Dashboard", href: "/" },
          { title: "Settings", href: "/settings/user-management" },
          { title: "User Management", href: "/settings/user-management?tab=users" },
        ]}
      />

      <div className="mt-4">
        <UsersForm />
      </div>
    </div>
  )
}
