"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { 
  IconLayoutDashboard, 
  IconReceipt, 
  IconListCheck, 
  IconFileCheck, 
  IconTruckDelivery, 
  IconShip, 
  IconUsers, 
  IconUserCog 
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
      isActive: true,
    },
    {
      title: "Purchase order",
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
