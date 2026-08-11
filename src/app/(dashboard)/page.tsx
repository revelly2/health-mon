import { Badge } from "@/components/ui/Badge"
import {
  Users,
  ActivitySquare,
  AlertTriangle,
  Syringe,
  UserCog,
  Plus,
  ClipboardPlus,
  ChevronRight,
  ArrowUpRight,
  CalendarDays,
} from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"

// ─── StatCard ────────────────────────────────────────────────
function StatCard({
  name,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  href,
}: {
  name: string
  value: number
  subtitle: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  href?: string
}) {
  const inner = (
    <div
      className="stat-card flex flex-col justify-between rounded-xl border p-5 group"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="stat-icon-shell" style={{ background: iconBg }}>
          <Icon className="h-5 w-5" style={{ color: iconColor }} strokeWidth={2} />
        </div>
        {href && (
          <ArrowUpRight
            className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
            style={{ color: "var(--color-muted-foreground)" }}
          />
        )}
      </div>
      <div className="mt-4">
        <div
          className="text-3xl font-bold tracking-tight"
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            color: "var(--color-foreground)",
          }}
        >
          {value}
        </div>
        <p className="mt-1 text-xs font-medium" style={{ color: "var(--color-foreground)" }}>
          {name}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          {subtitle}
        </p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

// ─── QuickAction ─────────────────────────────────────────────
function QuickAction({
  label,
  icon: Icon,
  href,
  color,
}: {
  label: string
  icon: React.ElementType
  href: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="quick-action-card flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium group"
      style={{
        background: "var(--color-card)",
        borderColor: "var(--color-border)",
        color: "var(--color-foreground)",
        boxShadow: "var(--shadow-xs)",
      }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-md flex-shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2} />
      </span>
      {label}
      <ChevronRight
        className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ color }}
      />
    </Link>
  )
}

// ─── RiskBadge ───────────────────────────────────────────────
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

// ─── Page ────────────────────────────────────────────────────
export default async function Dashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [
    { count: totalResidents },
    { count: highRisk },
    { count: recentCheckups },
    { count: vaccines },
    { count: totalStaff },
  ] = await Promise.all([
    supabase.from("residents").select("*", { count: "exact", head: true }),
    supabase.from("health_records").select("*", { count: "exact", head: true }).eq("risk_level", "High"),
    supabase.from("health_records").select("*", { count: "exact", head: true }).gte(
      "checkup_date",
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    ),
    supabase.from("vaccinations").select("*", { count: "exact", head: true }),
    supabase.from("employees").select("*", { count: "exact", head: true }),
  ])

  const { data: recentRecords } = await supabase
    .from("health_records")
    .select(`id, checkup_date, risk_level, chief_complaint, residents ( first_name, last_name, priority_group )`)
    .order("checkup_date", { ascending: false })
    .limit(6)

  const stats = [
    { name: "Total Residents",  value: totalResidents || 0,  subtitle: "Registered in system",   icon: Users,          iconBg: "var(--color-primary-light)", iconColor: "var(--color-primary)",            href: "/residents" },
    { name: "High-Risk Cases",  value: highRisk || 0,        subtitle: "Require attention",        icon: AlertTriangle,  iconBg: "var(--color-danger-light)",  iconColor: "var(--color-danger)",             href: "/records" },
    { name: "Recent Checkups",  value: recentCheckups || 0,  subtitle: "Last 30 days",             icon: ActivitySquare, iconBg: "var(--color-success-light)", iconColor: "var(--color-success)",            href: "/records" },
    { name: "Vaccinations",     value: vaccines || 0,        subtitle: "Total administered",       icon: Syringe,        iconBg: "#f3e8ff",                    iconColor: "#9333ea",                         href: "/vaccinations" },
    { name: "Staff Members",    value: totalStaff || 0,      subtitle: "Healthcare providers",     icon: UserCog,        iconBg: "var(--color-muted)",          iconColor: "var(--color-muted-foreground)",   href: "/staff" },
  ]

  const quickActions = [
    { label: "Add Resident",    icon: Users,          href: "/residents/new",    color: "var(--color-primary)" },
    { label: "Record Checkup",  icon: ClipboardPlus,  href: "/records/new",      color: "var(--color-success)" },
    { label: "Add Vaccination", icon: Syringe,        href: "/vaccinations/new", color: "#9333ea" },
    { label: "Add Staff",       icon: UserCog,        href: "/staff/new",        color: "var(--color-warning)" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--color-foreground)" }}>
          Overview
        </h2>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          Barangay health summary for today.
        </p>
      </div>

      {/* Stat bar */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => <StatCard key={s.name} {...s} />)}
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted-foreground)" }}>
          Quick Actions
        </p>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          {quickActions.map((a) => <QuickAction key={a.label} {...a} />)}
        </div>
      </div>

      {/* Activity + status */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent records — 2/3 */}
        <div
          className="lg:col-span-2 rounded-xl border"
          style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div>
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                Recent Health Records
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                Latest checkups and consultations
              </p>
            </div>
            <Link
              href="/records"
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: "var(--color-primary)" }}
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {recentRecords && recentRecords.length > 0 ? (
              recentRecords.map((record: any) => {
                const initials = `${record.residents?.first_name?.[0] ?? ""}${record.residents?.last_name?.[0] ?? ""}`.toUpperCase()
                return (
                  <div key={record.id} className="activity-row flex items-center gap-4 px-5 py-3.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                      style={{ background: "var(--color-sidebar-bg)" }}
                    >
                      {initials || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-foreground)" }}>
                        {record.residents?.first_name} {record.residents?.last_name}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
                        {record.chief_complaint || "Routine Checkup"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <RiskBadge level={record.risk_level || "Low"} />
                      <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>
                        <CalendarDays className="h-3 w-3" />
                        {new Date(record.checkup_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center" style={{ color: "var(--color-muted-foreground)" }}>
                <ActivitySquare className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Status sidebar — 1/3 */}
        <div className="space-y-3">
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--color-card)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-sm)" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>
              System Status
            </h3>
            <div className="space-y-3">
              {[
                { label: "Residents registered", value: totalResidents || 0, color: "var(--color-primary)" },
                { label: "Active staff",          value: totalStaff || 0,    color: "var(--color-success)" },
                { label: "Vaccines given",        value: vaccines || 0,      color: "#9333ea" },
                { label: "High-risk flags",       value: highRisk || 0,      color: "var(--color-danger)" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>{item.label}</span>
                  </div>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={{ color: "var(--color-foreground)", fontFamily: "var(--font-geist-mono), monospace" }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            href="/residents/new"
            className="quick-action-card flex items-center gap-3 rounded-xl border p-4 group"
            style={{
              background: "var(--color-primary)",
              borderColor: "var(--color-primary-dark)",
              boxShadow: "0 4px 14px rgba(14,165,233,0.25)",
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 flex-shrink-0">
              <Plus className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">New Resident</p>
              <p className="text-xs text-white/70">Register to the system</p>
            </div>
            <ChevronRight className="ml-auto h-4 w-4 text-white/60 group-hover:text-white transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  )
}
