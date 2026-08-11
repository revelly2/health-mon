"use client"

import React from "react"
import { MoreVertical, DownloadCloud, Trash2, Eye } from "lucide-react"

export interface ActivityLog {
  id: string
  created_at: string
  user_name: string
  user_avatar_url: string | null
  action: string
  target: string
  attachment_type: string | null
  attachment_name: string | null
  attachment_size: string | null
  labels: string[] | null
  is_unread: boolean
}

function getStatusBadge(action: string) {
  const normalized = action.toLowerCase()
  if (normalized.includes("deleted")) {
    return { label: "Deleted", dot: "#ef4444", text: "#b91c1c", bg: "#fef2f2", border: "#fecaca" }
  } else if (normalized.includes("updated") || normalized.includes("edited") || normalized.includes("modified")) {
    return { label: "Updated", dot: "#f59e0b", text: "#b45309", bg: "#fffbeb", border: "#fde68a" }
  } else {
    return { label: "Success", dot: "#22c55e", text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" }
  }
}

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  return (
    <div className="w-full rounded-xl border bg-white" style={{ borderColor: "#eaecf0", boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)" }}>
      {/* Table Header / Tabs Area */}
      <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#eaecf0" }}>
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">All activity</h2>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 border" style={{ borderColor: "#eaecf0" }}>
            {logs.length} logs
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-500">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 text-gray-500 font-medium text-[12px] border-b" style={{ borderColor: "#eaecf0" }}>
            <tr>
              <th className="px-5 py-3 w-[40px] font-medium tracking-wide">
                <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-600" />
              </th>
              <th className="px-5 py-3 font-medium tracking-wide">Action</th>
              <th className="px-5 py-3 font-medium tracking-wide">Target</th>
              <th className="px-5 py-3 font-medium tracking-wide">Date & Time ↓</th>
              <th className="px-5 py-3 font-medium tracking-wide">Status</th>
              <th className="px-5 py-3 font-medium tracking-wide">Executed by</th>
              <th className="px-5 py-3 w-[80px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "#eaecf0" }}>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                  No activity logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const status = getStatusBadge(log.action)
                const isDelete = log.action.toLowerCase().includes("deleted")
                const IconWrapperColor = isDelete ? "bg-red-100 text-red-600" : "bg-purple-100 text-purple-600"

                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                    {/* Checkbox */}
                    <td className="px-5 py-4">
                      <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-600" />
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-md ${IconWrapperColor}`}>
                          <Eye className="h-4 w-4" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-[13px] uppercase tracking-wide">
                            {log.action}
                          </p>
                          <p className="text-gray-500 text-[13px] truncate max-w-[150px]">
                            {log.attachment_name || "System Log"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Target */}
                    <td className="px-5 py-4 text-gray-600 font-medium text-[13px]">
                      {log.target}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-gray-600 text-[13px]">
                      {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span 
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium border"
                        style={{ background: status.bg, color: status.text, borderColor: status.border }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }}></span>
                        {status.label}
                      </span>
                    </td>

                    {/* Executed By */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {log.user_avatar_url ? (
                          <img
                            src={log.user_avatar_url}
                            alt={log.user_name}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold">
                            {log.user_name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col justify-center">
                          <p className="font-medium text-gray-900 text-[13px]">{log.user_name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-gray-400 hover:text-gray-600">
                          <DownloadCloud className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
