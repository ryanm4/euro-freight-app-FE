"use client"

import React, { useState } from "react"
import PageTitleWithBreadcrumb from "@/components/shared/page-title-with-breadcrumb"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  IconShip,
  IconPackage,
  IconTruck,
  IconFileInvoice,
  IconClipboardList,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconArrowUpRight,
  IconAnchor,
  IconWorld,
  IconMapPin,
  IconProgressCheck,
  IconBuildingWarehouse,
} from "@tabler/icons-react"

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const kpiCards = [
  {
    label: "Active Shipments",
    value: "24",
    change: "+3 this week",
    trend: "up",
    color: "#223F7A",
    badgeBg: "#223F7A15",
    icon: IconShip,
  },
  {
    label: "Purchase Orders",
    value: "58",
    change: "+8 this month",
    trend: "up",
    color: "#10b981",
    badgeBg: "#10b98115",
    icon: IconClipboardList,
  },
  {
    label: "Pending GRNs",
    value: "12",
    change: "2 overdue",
    trend: "warning",
    color: "#f59e0b",
    badgeBg: "#f59e0b15",
    icon: IconBuildingWarehouse,
  },
  {
    label: "In Transit",
    value: "9",
    change: "Avg ETA 4 days",
    trend: "up",
    color: "#6366f1",
    badgeBg: "#6366f115",
    icon: IconTruck,
  },
]

const recentShipments = [
  {
    id: "SHP-2026-001",
    vessel: "MSC SINGAPORE",
    origin: "Shanghai, CN",
    destination: "New York, US",
    eta: "Jun 22, 2026",
    status: "In Transit",
    progress: 65,
    statusColor: "#6366f1",
  },
  {
    id: "SHP-2026-002",
    vessel: "EVER GIVEN",
    origin: "Colombo, LK",
    destination: "Hamburg, DE",
    eta: "Jun 28, 2026",
    status: "Loaded",
    progress: 30,
    statusColor: "#8b5cf6",
  },
  {
    id: "SHP-2026-003",
    vessel: "MAERSK ESSEX",
    origin: "Guangzhou, CN",
    destination: "Dubai, AE",
    eta: "Jun 18, 2026",
    status: "Planned",
    progress: 10,
    statusColor: "#223F7A",
  },
  {
    id: "SHP-2026-004",
    vessel: "CMA CGM MARCO POLO",
    origin: "Klang, MY",
    destination: "Sydney, AU",
    eta: "Jun 15, 2026",
    status: "Delivered",
    progress: 100,
    statusColor: "#10b981",
  },
]

const shipmentStages = ["PO Created", "GRN Received", "Packed", "Loaded", "In Transit", "Customs", "Delivered"]

const trackerShipments = [
  {
    id: "SHP-2026-001",
    vessel: "MSC SINGAPORE",
    client: "Amara Holdings",
    currentStage: 4, // 0-indexed
    status: "In Transit",
    statusColor: "#6366f1",
  },
  {
    id: "SHP-2026-002",
    vessel: "EVER GIVEN",
    client: "Pacific Traders",
    currentStage: 3,
    status: "Loaded",
    statusColor: "#8b5cf6",
  },
  {
    id: "SHP-2026-005",
    vessel: "HAMBURG EXPRESS",
    client: "Euro Imports GmbH",
    currentStage: 6,
    status: "Delivered",
    statusColor: "#10b981",
  },
]

const operationalAlerts = [
  {
    title: "Customs Hold",
    detail: "SHP-2026-007 — Port of Dubai",
    icon: IconAlertTriangle,
    color: "text-red-600",
    bg: "bg-red-50",
    time: "2h ago",
  },
  {
    title: "ETA Delayed",
    detail: "MSC SINGAPORE — +3 days",
    icon: IconClock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    time: "4h ago",
  },
  {
    title: "GRN Pending",
    detail: "PO-2026-14 — Colombo Warehouse",
    icon: IconBuildingWarehouse,
    color: "text-blue-600",
    bg: "bg-blue-50",
    time: "6h ago",
  },
  {
    title: "Documents Ready",
    detail: "HBL-2026-023 — Cleared",
    icon: IconCircleCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    time: "1d ago",
  },
]

const statusBadgeStyle: Record<string, string> = {
  "In Transit": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Loaded": "bg-purple-50 text-purple-700 border-purple-200",
  "Planned": "bg-blue-50 text-blue-700 border-blue-200",
  "Delivered": "bg-green-50 text-green-700 border-green-200",
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "tracker">("overview")

  return (
    <div className="flex flex-1 flex-col gap-6 p-[24px] pt-0 mt-3 min-h-screen">

      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <PageTitleWithBreadcrumb isDashboard={true} />
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              activeTab === "overview"
                ? "bg-[#223F7A] text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("tracker")}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              activeTab === "tracker"
                ? "bg-[#223F7A] text-white shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Shipment Tracker
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* KPI Cards */}
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card
                key={kpi.label}
                className="md:col-span-3 border-none shadow-sm rounded-2xl bg-card p-6 flex flex-col gap-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {kpi.label}
                  </p>
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: kpi.badgeBg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-foreground">{kpi.value}</h2>
                  <p className={cn("text-xs font-semibold mt-1 flex items-center gap-1",
                    kpi.trend === "up" ? "text-green-600" : "text-amber-600"
                  )}>
                    {kpi.trend === "up" ? <IconArrowUpRight className="w-3 h-3" /> : <IconAlertTriangle className="w-3 h-3" />}
                    {kpi.change}
                  </p>
                </div>
              </Card>
            )
          })}

          {/* Hero Banner */}
          <Card className="md:col-span-12 border-none shadow-sm rounded-3xl overflow-hidden relative group bg-card">
            <div className="absolute left-1/2 -translate-x-1/2 -top-56 w-[400px] h-[400px] pointer-events-none group-hover:scale-105 transition-transform duration-700">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: "conic-gradient(from 160deg, #223F7A, #3b5998, #4a7cc9, #223F7A, #1a3060, #223F7A)",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 40px), #000 calc(100% - 40px))",
                  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 40px), #000 calc(100% - 40px))",
                }}
              />
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-stretch p-8 gap-8">
              <div className="flex-1 flex flex-col justify-center gap-4">
                <div className="flex items-center gap-2">
                  <IconShip className="w-8 h-8" style={{ color: "#223F7A" }} />
                  <h2 className="text-3xl font-black text-foreground">EURO Freight Operations</h2>
                </div>
                <p className="text-muted-foreground max-w-lg leading-relaxed">
                  Monitor your global freight shipments, purchase orders, and logistics pipeline all in one place.
                  You have <span className="font-bold text-foreground">9 shipments</span> currently in transit.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: "24 Active Shipments", color: "#223F7A" },
                    { label: "58 Open POs", color: "#10b981" },
                    { label: "12 Pending GRNs", color: "#f59e0b" },
                  ].map((tag) => (
                    <span
                      key={tag.label}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
              {/* Mini stats row */}
              <div className="lg:w-[360px] grid grid-cols-2 gap-4 items-center">
                {[
                  { label: "Sea Freight", value: "16", icon: IconShip },
                  { label: "Air Freight", value: "8", icon: IconWorld },
                  { label: "Customs Cleared", value: "41", icon: IconCircleCheck },
                  { label: "GDNs Issued", value: "33", icon: IconPackage },
                ].map((stat) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="bg-muted/60 rounded-2xl p-4 flex items-center gap-3">
                      <Icon className="w-5 h-5 text-[#223F7A]" />
                      <div>
                        <p className="text-2xl font-black text-foreground">{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground font-semibold">{stat.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Card>

          {/* Recent Shipments Table */}
          <Card className="md:col-span-8 border-none shadow-sm rounded-3xl bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Recent Shipments</h3>
              <span className="text-xs font-bold text-[#223F7A] cursor-pointer hover:underline">View All →</span>
            </div>
            <div className="space-y-3">
              {recentShipments.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:bg-muted/40 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#223F7A10]">
                    <IconShip className="w-5 h-5 text-[#223F7A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-foreground truncate">{s.vessel}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{s.id}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <IconMapPin className="w-3 h-3" />
                      {s.origin} → {s.destination}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${s.progress}%`, backgroundColor: s.statusColor }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", statusBadgeStyle[s.status])}
                    >
                      {s.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">ETA {s.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Operational Alerts */}
          <Card className="md:col-span-4 border-none shadow-sm rounded-3xl bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Alerts & Updates</h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                LIVE
              </div>
            </div>
            <div className="space-y-3">
              {operationalAlerts.map((alert, idx) => {
                const Icon = alert.icon
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-2xl border border-border hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className={cn("p-2 rounded-xl mt-0.5 shrink-0", alert.bg, alert.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">{alert.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{alert.detail}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{alert.time}</span>
                  </div>
                )
              })}
            </div>
          </Card>

        </div>
      )}

      {/* ─── Shipment Tracker Tab ─────────────────────────────────────────── */}
      {activeTab === "tracker" && (
        <div className="flex flex-col gap-6">
          <Card className="border-none shadow-sm rounded-3xl bg-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-[#223F7A10] flex items-center justify-center">
                <IconProgressCheck className="w-5 h-5 text-[#223F7A]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Live Shipment Tracker</h3>
                <p className="text-sm text-muted-foreground">Track end-to-end shipment milestones</p>
              </div>
            </div>

            <div className="space-y-10">
              {trackerShipments.map((ship) => (
                <div key={ship.id} className="border border-border rounded-2xl p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <IconShip className="w-5 h-5 text-[#223F7A]" />
                      <div>
                        <p className="font-bold text-foreground">{ship.vessel}</p>
                        <p className="text-xs text-muted-foreground">{ship.id} · {ship.client}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("text-xs font-bold px-3 py-1 rounded-full border", statusBadgeStyle[ship.status])}
                    >
                      {ship.status}
                    </Badge>
                  </div>

                  {/* Stage progress */}
                  <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted mx-[14px]" />
                    <div
                      className="absolute top-4 left-0 h-0.5 mx-[14px] transition-all duration-700"
                      style={{
                        width: `calc(${(ship.currentStage / (shipmentStages.length - 1)) * 100}% - 28px)`,
                        backgroundColor: ship.statusColor,
                      }}
                    />

                    {/* Stage dots */}
                    <div className="relative flex justify-between">
                      {shipmentStages.map((stage, idx) => {
                        const isCompleted = idx < ship.currentStage
                        const isCurrent = idx === ship.currentStage
                        return (
                          <div key={stage} className="flex flex-col items-center gap-2">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all",
                                isCompleted
                                  ? "border-transparent text-white"
                                  : isCurrent
                                  ? "border-[2px] text-white"
                                  : "border-muted bg-background"
                              )}
                              style={{
                                backgroundColor: isCompleted || isCurrent ? ship.statusColor : undefined,
                                borderColor: isCurrent ? ship.statusColor : undefined,
                                boxShadow: isCurrent ? `0 0 0 4px ${ship.statusColor}20` : undefined,
                              }}
                            >
                              {isCompleted ? (
                                <IconCircleCheck className="w-4 h-4" />
                              ) : isCurrent ? (
                                <IconAnchor className="w-4 h-4" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-semibold text-center max-w-[60px] leading-tight",
                                isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {stage}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary stats below tracker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "On Track", value: "18", color: "#10b981", bg: "#10b98115", icon: IconCircleCheck },
              { label: "Delayed", value: "4", color: "#f59e0b", bg: "#f59e0b15", icon: IconClock },
              { label: "Customs Hold", value: "2", color: "#ef4444", bg: "#ef444415", icon: IconAlertTriangle },
              { label: "Completed Today", value: "3", color: "#6366f1", bg: "#6366f115", icon: IconProgressCheck },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="border-none shadow-sm rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: stat.bg }}>
                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground font-semibold">{stat.label}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
