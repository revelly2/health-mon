import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { PageHeader } from "@/components/ui/PageHeader"
import { Alert } from "@/components/ui/Alert"
import { EmptyStateRow } from "@/components/ui/EmptyState"
import { TabLinks } from "@/components/ui/Tabs"
import { BPBadge, HRBadge } from "@/components/ui/VitalBadge"
import { Plus, Search, Filter, ArrowRight, FileText, AlertTriangle } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { RowActions } from "./RowActions"

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { variant: "destructive" | "warning" | "success" | "muted" }> = {
    High:     { variant: "destructive" },
    Moderate: { variant: "warning" },
    Low:      { variant: "success" },
  }
  const cfg = map[level] ?? { variant: "muted" }
  return (
    <Badge variant={cfg.variant}>
      <span
        className="risk-dot"
        style={{
          background:
            level === "High" ? "var(--color-danger)"
            : level === "Moderate" ? "var(--color-warning)"
            : "var(--color-success)",
        }}
      />
      {level}
    </Badge>
  )
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

export default async function HealthRecordsPage(props: {
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
    .from("health_records")
    .select(`
      id,
      checkup_date,
      chief_complaint,
      diagnosis,
      risk_level,
      blood_pressure,
      heart_rate,
      residents ( id, first_name, last_name ),
      profiles ( full_name )
    `)
    .order("checkup_date", { ascending: false })

  const records = allRecords ?? []

  // Counts per tab
  const countAll      = records.length
  const countHigh     = records.filter((r) => r.risk_level === "High").length
  const countModerate = records.filter((r) => r.risk_level === "Moderate").length
  const countLow      = records.filter((r) => r.risk_level === "Low").length

  // Filtered list
  let filtered =
    activeTab === "all" ? records
    : records.filter((r) => r.risk_level === (activeTab.charAt(0).toUpperCase() + activeTab.slice(1)))

  if (query) {
    filtered = filtered.filter(r => 
      `${r.residents?.first_name} ${r.residents?.last_name}`.toLowerCase().includes(query) ||
      (r.chief_complaint && r.chief_complaint.toLowerCase().includes(query)) ||
      (r.diagnosis && r.diagnosis.toLowerCase().includes(query))
    )
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const tabs = [
    { key: "all",      label: "All",      count: countAll },
    { key: "high",     label: "High Risk", count: countHigh },
    { key: "moderate", label: "Moderate",  count: countModerate },
    { key: "low",      label: "Low Risk",  count: countLow },
  ]

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      <PageHeader
        title="Health Records"
        description="View clinical history and log new patient visits."
        count={countAll}
        action={{ label: "New Record", href: "/records/new" }}
      />

      {/* High-risk alert banner */}
      {countHigh > 0 && (
        <Alert variant="destructive" title={`${countHigh} high-risk patient${countHigh > 1 ? "s" : ""} require attention`}>
          Review these records and ensure follow-ups are scheduled.
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" title="Failed to load records">
          {error.message}
        </Alert>
      )}

      <Card>
        {/* Toolbar */}
        <CardHeader
          className="flex flex-wrap items-center justify-between gap-3 space-y-0 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <SearchInput placeholder="Search records..." />
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Tabs */}
          <TabLinks tabs={tabs} activeKey={activeTab} basePath="/records" />
        </CardHeader>

        <CardContent className="p-0">
          {paginated.length === 0 ? (
            <table className="w-full">
              <tbody>
                <EmptyStateRow
                  icon={FileText}
                  title={activeTab === "all" ? "No health records found" : `No ${activeTab}-risk records`}
                  description="Records will appear here after checkups are logged."
                  action={{ label: "New Record", href: "/records/new" }}
                  colSpan={7}
                />
              </tbody>
            </table>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Date", "Patient", "Chief Complaint", "BP / HR", "Risk Level", "Recorder", "Actions", ""].map((col) => (
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
                          <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                            {new Date(record.checkup_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

                        {/* Complaint / Dx */}
                        <td className="px-5 py-3.5 max-w-[180px]">
                          <p className="text-sm truncate" style={{ color: "var(--color-foreground)" }}>
                            {record.chief_complaint || <span style={{ color: "var(--color-muted-foreground)" }}>N/A</span>}
                          </p>
                          {record.diagnosis && (
                            <p className="text-[11px] truncate mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                              Dx: {record.diagnosis}
                            </p>
                          )}
                        </td>

                        {/* Vitals */}
                        <td className="px-5 py-3.5">
                          <div className="space-y-1">
                            <BPBadge value={record.blood_pressure} />
                            <HRBadge value={record.heart_rate} />
                          </div>
                        </td>

                        {/* Risk */}
                        <td className="px-5 py-3.5">
                          <RiskBadge level={record.risk_level || "Low"} />
                        </td>

                        {/* Recorder */}
                        <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                          {record.profiles?.full_name === "Unknown User" || !record.profiles?.full_name ? "Admin User" : record.profiles.full_name}
                        </td>

                        {/* Actions: Copy, Edit, Delete */}
                        <RowActions record={record} />

                        {/* Action View */}
                        <td className="px-5 py-3.5 text-right">
                          <Link href={`/records/${record.id}`}>
                            <Button variant="ghost" size="icon-sm" title="View record">
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
