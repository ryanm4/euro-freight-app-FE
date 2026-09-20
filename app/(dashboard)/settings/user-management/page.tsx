"use client"

import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchGroups } from "@/lib/api/groups"
import { fetchRoles } from "@/lib/api/roles"
import { fetchUsers } from "@/lib/api/users"
import { GROUP_LIST } from "@/modules/groups/types"
import { ROLE_LIST } from "@/modules/roles/types"
import { USER_LIST } from "@/modules/users/types"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

import { groupColumns } from "../../groups/_components/groups-columns"
import { DataTable as GroupsDataTable } from "../../groups/_components/groups-table"
import { roleColumns } from "../../roles/_components/roles-columns"
import { DataTable as RolesDataTable } from "../../roles/_components/roles-table"
import { userColumns } from "./_components/users-columns"
import { UsersDataTable } from "./_components/users-table"

export default function UserManagementPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "users"

  const [searchValue, setSearchValue] = useState("")

  // Fetch Users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetchUsers(),
  })

  // Fetch Groups
  const { data: groupsData, isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: () => fetchGroups(),
  })

  // Fetch Roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles(),
  })

  const handleTabChange = (val: string) => {
    setSearchValue("")
    router.push(`/settings/user-management?tab=${val}`)
  }

  // User Actions
  const userActions = {
    onView: (id: string) => router.push(`/settings/user-management/users/${id}`),
  }

  // Role Actions
  const roleActions = {
    onEdit: (id: string) => router.push(`/roles/${id}/edit`),
    onDelete: (id: string) => {},
    onView: (id: string) => router.push(`/roles/${id}`),
  }

  // Group Actions
  const groupActions = {
    onEdit: (id: string) => router.push(`/groups/${id}/edit`),
    onDelete: (id: string) => {},
    onView: (id: string) => router.push(`/groups/${id}`),
  }

  const uColumns = userColumns(userActions)
  const rColumns = roleColumns(roleActions)
  const gColumns = groupColumns(groupActions)

  // Standardize data arrays safely
  const usersList: USER_LIST[] = Array.isArray(usersData)
    ? usersData
    : Array.isArray(usersData?.data)
      ? usersData.data
      : []

  const groupsList: GROUP_LIST[] = Array.isArray(groupsData)
    ? groupsData
    : Array.isArray(groupsData?.data)
      ? groupsData.data
      : []

  const rolesList: ROLE_LIST[] = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray(rolesData?.data)
      ? rolesData.data
      : []

  return (
    <div className="mt-3 flex flex-1 flex-col gap-4 p-6 pt-0">
      <PageTitleWithBreadcrumb
        title="User Management"
        breadcrumbs={[
          { title: "Dashboard", href: "/" },
          { title: "Settings", href: "/settings/user-management" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab}...`}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-9"
              />
            </div>

            {activeTab === "users" && (
              <Button onClick={() => router.push("/settings/user-management/users/create")}>
                <IconPlus className="mr-2 h-4 w-4" /> Create User
              </Button>
            )}
            {activeTab === "groups" && (
              <Button onClick={() => router.push("/groups/create")}>
                <IconPlus className="mr-2 h-4 w-4" /> Create Group
              </Button>
            )}
            {activeTab === "roles" && (
              <Button onClick={() => router.push("/roles/create")}>
                <IconPlus className="mr-2 h-4 w-4" /> Create Role
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="users" className="pt-4">
          <UsersDataTable
            columns={uColumns}
            data={usersList}
            searchValue={searchValue}
            isLoading={usersLoading}
          />
        </TabsContent>

        <TabsContent value="groups" className="pt-4">
          <GroupsDataTable
            columns={gColumns}
            data={groupsList}
            searchValue={searchValue}
            isLoading={groupsLoading}
          />
        </TabsContent>

        <TabsContent value="roles" className="pt-4">
          <RolesDataTable
            columns={rColumns}
            data={rolesList}
            searchValue={searchValue}
            isLoading={rolesLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
