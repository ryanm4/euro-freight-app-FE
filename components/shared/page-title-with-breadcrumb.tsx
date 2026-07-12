"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import React, { useEffect, useState } from "react"

interface PageTitleWithBreadcrumbProps {
  title?: string
  breadcrumbs?: { title: string; href: string }[]
  isDashboard?: boolean
  userName?: string
}

function PageTitleWithBreadcrumb({
  title,
  breadcrumbs = [],
  isDashboard = false,
}: PageTitleWithBreadcrumbProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  useEffect(() => {
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    if (!currentTime) return "Good"
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const formatDate = () => {
    if (!currentTime) return ""
    return currentTime.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = () => {
    if (!currentTime) return ""
    return currentTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  if (isDashboard) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">Dashboard</span>
        <h1 className="text-2xl font-semibold tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-sm text-muted-foreground">
          {currentTime ? `${formatDate()} · ${formatTime()}` : "\u00A0"}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={crumb.href}>{crumb.title}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </React.Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
    </div>
  )
}

export default PageTitleWithBreadcrumb