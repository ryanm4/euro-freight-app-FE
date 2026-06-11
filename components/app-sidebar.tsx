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
  IconUserCog,
  IconUsers,
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
      title: "Good Received Notes",
      url: "/grn",
      icon: <IconFileCheck />,
    },
    {
      title: "Goods Dispatched Notes",
      url: "/gdn",
      icon: <IconTruckDelivery />,
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
      title: "Clients",
      url: "/clients",
      icon: <IconUsers />,
    },
    {
      title: "Users",
      url: "/users",
      icon: <IconUserCog />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  const navMainWithActiveState = data.navMain.map((item) => ({
    ...item,
    isActive: pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url)),
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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
