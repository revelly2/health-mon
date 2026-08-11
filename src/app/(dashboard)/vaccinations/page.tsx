import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { EmptyStateRow } from "@/components/ui/EmptyState"
import { TabLinks } from "@/components/ui/Tabs"
import { DosePips } from "@/components/ui/Progress"
import { Syringe, Search, Filter, AlertTriangle, Clock, CheckCircle2 } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { RowActions } from "./RowActions"

function isOverdue(dueDate: string | null) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

function isDueSoon(dueDate: string | null) {
  if (!dueDate) return false
  const diff = new Date(dueDate).getTime() - Date.now()
  return diff > 0 && diff < 14 * 24 * 60 * 60 * 1000 // within 14 days
}

const avatarColors = [
  { bg: "#e0f2fe", text: "#0284c7" },
  { bg: "#d1fae5", text: "#059669" },
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#f3e8ff", text: "#9333ea" },
  { bg: "#fee2e2", text: "#dc2626" },
]

function colorForName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % avatarColors.length
  return avatarColors[h]
}

import { SearchInput } from "@/components/ui/SearchInput"
import { Pagination } from "@/components/ui/Pagination"

export default async function VaccinationsPage(props: {
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
    .from("vaccinations")
    .select(`
      id,
      vaccine_name,
      dose_number,
      date_administered,
      next_due_date,
      residents ( id, first_name, last_name ),
      profiles ( full_name )
    `)
    .order("date_administered", { ascending: false })

  const records = allRecords ?? []

  // Counts
  const countAll      = records.length
  const countOverdue  = records.filter((r) => isOverdue(r.next_due_date)).length
  const countDueSoon  = records.filter((r) => isDueSoon(r.next_due_date)).length
  const countComplete = records.filter((r) => !r.next_due_date).length

  // Filter
  let filtered =
    activeTab === "overdue"  ? records.filter((r) => isOverdue(r.next_due_date))
    : activeTab === "due-soon" ? records.filter((r) => isDueSoon(r.next_due_date))
    : activeTab === "complete" ? records.filter((r) => !r.next_due_date)
    : records

  if (query) {
    filtered = filtered.filter(r => 
      `${r.residents?.first_name} ${r.residents?.last_name}`.toLowerCase().includes(query) ||
      (r.vaccine_name && r.vaccine_name.toLowerCase().includes(query))
    )
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tabs = [
    { key: "all",      label: "All",      count: countAll },
    { key: "overdue",  label: "Overdue",  count: countOverdue },
    { key: "due-soon", label: "Due Soon", count: countDueSoon },
    { key: "complete", label: "Complete", count: countComplete },
  ]

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      <PageHeader
        title="Vaccinations"
        description="Track immunizations and dose schedules."
        count={countAll}
        action={{ label: "Log Vaccination", href: "/vaccinations/new", icon: Syringe }}
      />

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Administered",
            value: countAll,
            icon: Syringe,
            iconBg: "var(--color-primary-light)",
            iconColor: "var(--color-primary)",
          },
          {
            label: "Due Within 14 Days",
            value: countDueSoon,
            icon: Clock,
            iconBg: "var(--color-warning-light)",
            iconColor: "var(--color-warning)",
          },
          {
            label: "Overdue",
            value: countOverdue,
            icon: AlertTriangle,
            iconBg: "var(--color-danger-light)",
            iconColor: "var(--color-danger)",
          },
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
            <div className="stat-icon-shell" style={{ background: tile.iconBg }}>
              <tile.icon className="h-5 w-5" style={{ color: tile.iconColor }} strokeWidth={2} />
            </div>
            <div>
              <p
                className="text-2xl font-bold tabular-nums"
                style={{ fontFamily: "var(--font-geist-mono), monospace", color: "var(--color-foreground)" }}
              >
                {tile.value}
              </p>
              <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {tile.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {countOverdue > 0 && (
        <Alert
          variant="destructive"
          title={`${countOverdue} overdue vaccination${countOverdue > 1 ? "s" : ""}`}
        >
          These residents have missed their scheduled next dose. Please follow up.
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" title="Failed to load vaccinations">
          {error.message}
        </Alert>
      )}

      <Card>
        <CardHeader
          className="flex flex-wrap items-center justify-between gap-3 space-y-0 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <SearchInput placeholder="Search vaccinations..." />
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          <TabLinks tabs={tabs} activeKey={activeTab} basePath="/vaccinations" />
        </CardHeader>

        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <table className="w-full">
              <tbody>
                <EmptyStateRow
                  icon={Syringe}
                  title={activeTab === "all" ? "No vaccinations recorded" : `No ${activeTab} vaccinations`}
                  description="Vaccination records will appear here after they are logged."
                  action={{ label: "Log Vaccination", href: "/vaccinations/new" }}
                  colSpan={6}
                />
              </tbody>
            </table>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Date", "Patient", "Vaccine", "Dose Progress", "Next Due", "Administered By", "Actions"].map((col) => (
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
                    const overdue = isOverdue(record.next_due_date)
                    const dueSoon = isDueSoon(record.next_due_date)
                    const totalDoses = 2
                    const currentDose = parseInt(record.dose_number) || 1

                    return (
                      <tr key={record.id} className="table-row-hover">
                        {/* Date */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                            {new Date(record.date_administered).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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

                        {/* Vaccine */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Syringe className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--color-primary)" }} />
                            <span className="text-sm" style={{ color: "var(--color-foreground)" }}>
                              {record.vaccine_name}
                            </span>
                          </div>
                        </td>

                        {/* Dose progress */}
                        <td className="px-5 py-3.5">
                          <DosePips current={currentDose} total={totalDoses} />
                        </td>

                        {/* Next due */}
                        <td className="px-5 py-3.5">
                          {record.next_due_date ? (
                            <div className="flex items-center gap-1.5">
                              {overdue ? (
                                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--color-danger)" }} />
                              ) : dueSoon ? (
                                <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--color-warning)" }} />
                              ) : null}
                              <span
                                className="text-sm font-medium"
                                style={{
                                  color: overdue ? "var(--color-danger)"
                                    : dueSoon ? "var(--color-warning)"
                                    : "var(--color-muted-foreground)",
                                }}
                              >
                                {new Date(record.next_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                              {overdue && (
                                <Badge variant="destructive" className="py-0">Overdue</Badge>
                              )}
                              {dueSoon && !overdue && (
                                <Badge variant="warning" className="py-0">Soon</Badge>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "var(--color-success)" }} />
                              <span className="text-sm" style={{ color: "var(--color-success)" }}>Complete</span>
                            </div>
                          )}
                        </td>

                        {/* Administered by */}
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
