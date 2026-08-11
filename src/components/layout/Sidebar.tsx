"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeLine,
  Users01,
  File02,
  Settings01,
  MessageChatCircle,
  Folder,
  ChevronDown,
  ChevronRight,
  Heart
} from "@untitledui/icons"

type NavItemDividerType = { divider: true }

type SubItem = {
  label: string
  href: string
  badge?: number | React.ReactNode
}

type NavItemType = {
  label: string
  href?: string
  icon: React.ElementType
  badge?: number | React.ReactNode | ((counts: Record<string, number>) => number | React.ReactNode)
  items?: SubItem[]
}

const navItems: (NavItemType | NavItemDividerType)[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: HomeLine,
  },
  { divider: true },
  {
    label: "Patients & Care",
    icon: Folder,
    items: [
      { label: "Residents", href: "/residents", badge: (c) => c.residents },
      { label: "Health Records", href: "/records", badge: (c) => c.records },
      { label: "Vaccinations", href: "/vaccinations", badge: (c) => c.vaccinations },
      { label: "Maternal Care", href: "/maternal", badge: (c) => c.maternal },
    ],
  },
  { divider: true },
  {
    label: "Staff Directory",
    href: "/staff",
    icon: Users01,
  },
  {
    label: "Activity Logs",
    href: "/logs",
    icon: File02,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings01,
  },
]

export function Sidebar({ 
  counts = {}, 
  user = { name: "Admin User", email: "admin@user.com" } 
}: { 
  counts?: Record<string, number>
  user?: { name: string; email: string }
}) {
  const pathname = usePathname()
  
  // State for expanded folders
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "Patients & Care": true // Open by default
  })

  const toggleFolder = (label: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  return (
    <div
      className="flex h-full w-[260px] flex-col bg-white"
      style={{
        borderRight: "1px solid #eaecf0",
      }}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-5 mb-2 mt-1">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm flex-shrink-0"
          style={{ background: "#0ea5e9", boxShadow: "0 1px 3px rgba(14,165,233,0.3)" }}
        >
          <Heart className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-bold tracking-tight text-gray-900 text-[13px] leading-tight max-w-[160px]">
          BARANGAY HEALTH STATUS MONITORING SYSTEM
        </span>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => {
            if ("divider" in item) {
              return (
                <div 
                  key={`div-${index}`} 
                  className="my-3 border-t" 
                  style={{ borderColor: "#f2f4f7" }} 
                />
              )
            }

            const hasItems = item.items && item.items.length > 0
            const isExpanded = expandedFolders[item.label]
            const isActive = item.href === "/" ? pathname === "/" : (item.href ? pathname.startsWith(item.href) : false)

            return (
              <div key={item.label} className="flex flex-col">
                {/* Main Item */}
                {hasItems ? (
                  <button
                    onClick={() => toggleFolder(item.label)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 text-gray-700 group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
                      <span>{item.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href!}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors group ${
                      isActive ? "bg-gray-50 text-gray-900" : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {typeof item.badge === 'function' ? item.badge(counts) : item.badge}
                      </span>
                    )}
                  </Link>
                )}

                {/* Sub Items */}
                {hasItems && isExpanded && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-9 pr-1">
                    {item.items!.map((subItem) => {
                      const isSubActive = pathname.startsWith(subItem.href)
                      return (
                        <Link
                          key={subItem.label}
                          href={subItem.href}
                          className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            isSubActive ? "bg-gray-50 text-gray-900" : "hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          <span>{subItem.label}</span>
                          {subItem.badge && (
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              isSubActive ? "bg-white border border-gray-200 text-gray-900 shadow-sm" : "bg-gray-100 text-gray-600"
                            }`}>
                              {typeof subItem.badge === 'function' ? subItem.badge(counts) : subItem.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold text-sm border border-sky-200 shadow-sm uppercase">
            {user.name ? user.name.substring(0, 1) : user.email.substring(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
