"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  IconFileCheck,
  IconFileInvoice,
  IconLayoutDashboard,
  IconListCheck,
  IconReceipt,
  IconShip,
  IconTruckDelivery,
  IconUserCircle,
  IconUserCog,
  IconUsers,
  IconUsersGroup,
  IconSailboat,
} from "@tabler/icons-react"

// This is sample data.
const data = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <IconLayoutDashboard />,
    },
    {
      title: "Purchase Order",
      url: "/purchase-order",
      icon: <IconReceipt />,
    },
    {
      title: "Packing List",
      url: "/packing-list",
      icon: <IconListCheck />,
    },
    {
      title: "Goods Dispatched Notes",
      url: "/gdn",
      icon: <IconTruckDelivery />,
    },
    {
      title: "Good Received Notes",
      url: "/grn",
      icon: <IconFileCheck />,
    },

    {
      title: "Shipment",
      url: "/shipment",
      icon: <IconShip />,
    },
    {
      title: "HBL/HAWB",
      url: "/hbl-hawb",
      icon: <IconFileInvoice />,
    },
    {
      title: "HBL Dashboard",
      url: "/hbl-dashboard",
      icon: <IconSailboat />,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: <IconUsers />,
    },
    {
      title: "Users",
      url: "/users",
      icon: <IconUserCircle />,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: <IconUserCog />,
    },
    {
      title: "Groups",
      url: "/groups",
      icon: <IconUsersGroup />,
    },
  ],
}

function subscribeToStoredUser(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange)
  return () => window.removeEventListener("storage", onStoreChange)
}

function getStoredUserSnapshot() {
  return sessionStorage.getItem("user")
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const storedUser = React.useSyncExternalStore(
    subscribeToStoredUser,
    getStoredUserSnapshot,
    () => null
  )
  const parsedUser = React.useMemo(() => {
    if (!storedUser) return null

    try {
      const user: unknown = JSON.parse(storedUser)
      return typeof user === "object" && user !== null
        ? (user as Record<string, unknown>)
        : null
    } catch {
      console.error("Failed to parse user from session storage")
      return null
    }
  }, [storedUser])

  const groups = parsedUser?.groups
  const isClientUser =
    Array.isArray(groups) &&
    groups.some(
      (group: unknown) =>
        typeof group === "object" &&
        group !== null &&
        "group_name" in group &&
        typeof group.group_name === "string" &&
        group.group_name.trim().toLowerCase() === "client"
    )
  const user = {
    name:
      (typeof parsedUser?.full_name === "string" && parsedUser.full_name) ||
      (typeof parsedUser?.name === "string" && parsedUser.name) ||
      (typeof parsedUser?.username === "string" && parsedUser.username) ||
      data.user.name,
    email:
      (typeof parsedUser?.email === "string" && parsedUser.email) ||
      data.user.email,
    avatar:
      (typeof parsedUser?.avatar === "string" && parsedUser.avatar) ||
      data.user.avatar,
  }

  const visibleNavItems = isClientUser
    ? data.navMain.filter(
        (item) =>
          item.url === "/hbl-hawb" || item.url === "/hbl-dashboard"
      )
    : data.navMain

  const navMainWithActiveState = visibleNavItems.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url !== "/" && pathname.startsWith(item.url)),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <IconShip className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">EURO Freight</span>
                  <span className="truncate text-xs">App</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithActiveState} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
