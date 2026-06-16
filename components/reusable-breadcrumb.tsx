"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface BreadcrumbItemProps {
  title: string
  url?: string
}

export interface ReusableBreadcrumbProps {
  items?: BreadcrumbItemProps[]
}

export function ReusableBreadcrumb({ items }: ReusableBreadcrumbProps) {
  const pathname = usePathname()
  
  // If items are provided, use them. Otherwise, generate from pathname.
  const pathSegments = pathname.split('/').filter(segment => segment !== '')
  
  const defaultItems = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`
    const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    return { title, url }
  })
  
  // Add Home if default items are used and not at root
  if (!items && pathname !== '/') {
    defaultItems.unshift({ title: 'Home', url: '/' })
  }

  const breadcrumbs = items || (defaultItems.length > 0 ? defaultItems : [{ title: 'Home' }])

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1
          
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !item.url ? (
                  <BreadcrumbPage>{item.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.url}>{item.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
