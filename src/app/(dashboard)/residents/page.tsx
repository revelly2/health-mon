import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Plus, Search, Filter, ArrowRight, Users } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { RowActions } from "./RowActions"

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { variant: "destructive" | "warning" | "success" | "muted"; dot: string }> = {
    High:     { variant: "destructive", dot: "risk-dot risk-dot-high" },
    Moderate: { variant: "warning",     dot: "risk-dot risk-dot-moderate" },
    Low:      { variant: "success",     dot: "risk-dot risk-dot-low" },
  }
  const cfg = map[level] ?? { variant: "muted", dot: "risk-dot" }
  return (
    <Badge variant={cfg.variant}>
      <span className={cfg.dot} />
      {level}
    </Badge>
  )
}

function PriorityBadge({ group }: { group: string }) {
  return <Badge variant="muted">{group}</Badge>
}

function getInitials(name: string) {
  const parts = name.split(",").reverse().join(" ").trim().split(" ")
  return parts.map((p) => p[0]).slice(0, 2).join("").toUpperCase()
}

const avatarColors = [
  { bg: "#e0f2fe", text: "#0284c7" },
  { bg: "#d1fae5", text: "#059669" },
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#f3e8ff", text: "#9333ea" },
  { bg: "#fee2e2", text: "#dc2626" },
  { bg: "#e0e7ff", text: "#4338ca" },
]

function colorForName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % avatarColors.length
  return avatarColors[h]
}

import { SearchInput } from "@/components/ui/SearchInput"
import { Pagination } from "@/components/ui/Pagination"

export default async function ResidentsPage(props: { searchParams?: Promise<{ query?: string, page?: string }> }) {
  const searchParams = await props.searchParams
  const query = searchParams?.query?.toLowerCase() || ""
  const page = parseInt(searchParams?.page || "1")
  const pageSize = 10

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: residents, error } = await supabase
    .from("residents")
    .select(`id, first_name, last_name, date_of_birth, gender, priority_group, address, health_records ( checkup_date, risk_level )`)
    .order("last_name", { ascending: true })

  const processedResidents = residents?.map((r) => {
    const recentRecord = r.health_records?.sort((a: any, b: any) =>
      new Date(b.checkup_date).getTime() - new Date(a.checkup_date).getTime()
    )[0] as any
    return {
      id: r.id,
      name: `${r.last_name}, ${r.first_name}`,
      dob: r.date_of_birth,
      gender: r.gender,
      priority: r.priority_group,
      risk: recentRecord?.risk_level || "Low",
      lastVisit: recentRecord
        ? new Date(recentRecord.checkup_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "Never",
      // Raw fields for the edit form
      first_name: r.first_name,
      last_name: r.last_name,
      date_of_birth: r.date_of_birth,
      priority_group: r.priority_group,
      address: (r as any).address ?? null,
    }
  }) || []

  let filtered = processedResidents
  if (query) {
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(query) || 
      (r.priority && r.priority.toLowerCase().includes(query))
    )
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      {/* Page heading */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--color-foreground)" }}>
              Residents
            </h2>
            <span
              className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
            >
              {processedResidents.length}
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Manage and view all registered residents.
          </p>
        </div>
        <Link href="/residents/new">
          <Button size="default">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add Resident
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ background: "var(--color-danger-light)", borderColor: "rgba(239,68,68,0.2)", color: "var(--color-danger-dark)" }}
        >
          Failed to load residents: {error.message}
        </div>
      )}

      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <SearchInput placeholder="Search residents..." />
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {filtered.length} total
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--color-muted-foreground)" }}>
              <Users className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No residents found</p>
              <p className="text-xs mt-1">Add your first resident to get started.</p>
              <Link href="/residents/new" className="mt-4">
                <Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Resident</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Resident", "Priority Group", "Risk Level", "Gender", "Last Visit", "Actions", ""].map((col) => (
                      <th
                        key={col}
                        className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                  {paginated.map((resident) => {
                    const initials = getInitials(resident.name)
                    const { bg, text } = colorForName(resident.name)
                    return (
                      <tr key={resident.id} className="table-row-hover">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                              style={{ background: bg, color: text }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-medium text-sm leading-tight" style={{ color: "var(--color-foreground)" }}>
                                {resident.name}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                                DOB: {resident.dob}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><PriorityBadge group={resident.priority} /></td>
                        <td className="px-5 py-3.5"><RiskBadge level={resident.risk} /></td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>{resident.gender}</td>
                        <td className="px-5 py-3.5 text-sm tabular-nums" style={{ color: "var(--color-muted-foreground)" }}>{resident.lastVisit}</td>
                        <RowActions resident={resident} />
                        <td className="px-5 py-3.5 text-right">
                          <Link href={`/residents/${resident.id}`}>
                            <Button variant="ghost" size="icon-sm" title="View profile">
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <Pagination currentPage={page} totalPages={totalPages} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
