import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { EmptyStateRow } from "@/components/ui/EmptyState"
import { TabLinks } from "@/components/ui/Tabs"
import { TrimesterProgress } from "@/components/ui/Progress"
import { FHRBadge } from "@/components/ui/VitalBadge"
import { Badge } from "@/components/ui/Badge"
import { Baby, Search, Filter, Ruler } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/Button"
import { RowActions } from "./RowActions"

const avatarColors = [
  { bg: "#f3e8ff", text: "#9333ea" },
  { bg: "#fce7f3", text: "#db2777" },
  { bg: "#e0f2fe", text: "#0284c7" },
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#d1fae5", text: "#059669" },
]

function colorForName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % avatarColors.length
  return avatarColors[h]
}

const trimesterColors: Record<number, { variant: "info" | "default" | "warning" }> = {
  1: { variant: "info" },
  2: { variant: "default" },
  3: { variant: "warning" },
}

import { SearchInput } from "@/components/ui/SearchInput"
import { Pagination } from "@/components/ui/Pagination"

export default async function MaternalCarePage(props: {
  searchParams?: Promise<{ tab?: string; query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const activeTab = searchParams?.tab ?? "all"
  const query = searchParams?.query?.toLowerCase() || ""
  const page = parseInt(searchParams?.page || "1")
  const pageSize = 10

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: allRecords, error } = await supabase
    .from("maternal_care_logs")
    .select(`
      id,
      trimester,
      checkup_date,
      fetal_heart_rate,
      fundal_height,
      residents ( id, first_name, last_name ),
      profiles ( full_name )
    `)
    .order("checkup_date", { ascending: false })

  const records = allRecords ?? []

  // Counts
  const count1 = records.filter((r) => r.trimester === 1).length
  const count2 = records.filter((r) => r.trimester === 2).length
  const count3 = records.filter((r) => r.trimester === 3).length

  // Abnormal FHR: < 110 or > 160
  const abnormalFHR = records.filter((r) => {
    const fhr = r.fetal_heart_rate
    return fhr !== null && (fhr < 110 || fhr > 160)
  }).length

  // Filter
  let filtered =
    activeTab === "1" ? records.filter((r) => r.trimester === 1)
    : activeTab === "2" ? records.filter((r) => r.trimester === 2)
    : activeTab === "3" ? records.filter((r) => r.trimester === 3)
    : records

  if (query) {
    filtered = filtered.filter((r: any) => 
      `${r.residents?.first_name} ${r.residents?.last_name}`.toLowerCase().includes(query)
    )
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tabs = [
    { key: "all", label: "All",            count: records.length },
    { key: "1",   label: "1st Trimester",  count: count1 },
    { key: "2",   label: "2nd Trimester",  count: count2 },
    { key: "3",   label: "3rd Trimester",  count: count3 },
  ]

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      <PageHeader
        title="Maternal Care"
        description="Track prenatal checkups and fetal development."
        count={records.length}
        action={{ label: "Log Checkup", href: "/maternal/new", icon: Baby }}
      />

      {/* Abnormal FHR alert */}
      {abnormalFHR > 0 && (
        <Alert
          variant="warning"
          title={`${abnormalFHR} record${abnormalFHR > 1 ? "s" : ""} with abnormal fetal heart rate`}
        >
          Normal fetal heart rate is 110–160 bpm. Please review the flagged records.
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" title="Failed to load maternal care records">
          {error.message}
        </Alert>
      )}

      {/* Trimester stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "1st Trimester",  count: count1, color: "var(--color-primary)",  bg: "var(--color-primary-light)" },
          { label: "2nd Trimester",  count: count2, color: "#9333ea",                bg: "#f3e8ff" },
          { label: "3rd Trimester",  count: count3, color: "var(--color-warning)",  bg: "var(--color-warning-light)" },
        ].map((tile) => (
          <div
            key={tile.label}
            className="stat-card flex items-center gap-4 rounded-xl border p-4"
            style={{
              background: "var(--color-card)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div className="stat-icon-shell" style={{ background: tile.bg }}>
              <Baby className="h-5 w-5" style={{ color: tile.color }} strokeWidth={2} />
            </div>
            <div>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ fontFamily: "var(--font-geist-mono), monospace", color: "var(--color-foreground)" }}
              >
                {tile.count}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{tile.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader
          className="flex flex-wrap items-center justify-between gap-3 space-y-0 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <SearchInput placeholder="Search patients..." />
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          <TabLinks tabs={tabs} activeKey={activeTab} basePath="/maternal" />
        </CardHeader>

        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <table className="w-full">
              <tbody>
                <EmptyStateRow
                  icon={Baby}
                  title="No maternal care records found"
                  description="Records will appear here after prenatal checkups are logged."
                  action={{ label: "Log Checkup", href: "/maternal/new" }}
                  colSpan={6}
                />
              </tbody>
            </table>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Date", "Patient", "Trimester", "Fetal HR", "Fundal Height", "Midwife", "Actions"].map((col) => (
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
                  {paginated.map((record: any) => {
                    const name = `${record.residents?.first_name ?? ""}${record.residents?.last_name ?? ""}`
                    const { bg, text } = colorForName(name)
                    const initials = `${record.residents?.first_name?.[0] ?? ""}${record.residents?.last_name?.[0] ?? ""}`.toUpperCase()

                    return (
                      <tr key={record.id} className="table-row-hover">
                        {/* Date */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                            {new Date(record.checkup_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </td>

                        {/* Patient */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold flex-shrink-0"
                              style={{ background: bg, color: text }}
                            >
                              {initials || "?"}
                            </div>
                            <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                              {record.residents?.last_name}, {record.residents?.first_name}
                            </span>
                          </div>
                        </td>

                        {/* Trimester progress */}
                        <td className="px-5 py-3.5">
                          <TrimesterProgress trimester={record.trimester ?? 1} />
                        </td>

                        {/* Fetal HR */}
                        <td className="px-5 py-3.5">
                          <FHRBadge value={record.fetal_heart_rate} />
                        </td>

                        {/* Fundal height */}
                        <td className="px-5 py-3.5">
                          {record.fundal_height ? (
                            <div className="flex items-center gap-1.5">
                              <Ruler className="h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
                              <span className="text-sm tabular-nums" style={{ color: "var(--color-foreground)" }}>
                                {record.fundal_height} cm
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: "var(--color-muted-foreground)" }}>—</span>
                          )}
                        </td>

                        {/* Midwife */}
                        <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                          {record.profiles?.full_name === "Unknown User" || !record.profiles?.full_name ? "Admin User" : record.profiles.full_name}
                        </td>

                        {/* Actions: Copy, Edit, Delete */}
                        <RowActions record={record} />
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
