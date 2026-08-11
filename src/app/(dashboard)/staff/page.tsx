import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Plus, Search, Filter, UserCog, ArrowRight } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import Link from "next/link"

const avatarColors = [
  { bg: "#e0f2fe", text: "#0284c7" },
  { bg: "#d1fae5", text: "#059669" },
  { bg: "#fef3c7", text: "#d97706" },
  { bg: "#f3e8ff", text: "#9333ea" },
  { bg: "#e0e7ff", text: "#4338ca" },
]

function colorForName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % avatarColors.length
  return avatarColors[h]
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase()
}

export default async function StaffPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: staff, error } = await supabase
    .from("employees")
    .select("*")
    .order("last_name", { ascending: true })

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      {/* Page heading */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight" style={{ color: "var(--color-foreground)" }}>
              Staff Directory
            </h2>
            <span
              className="inline-flex h-5 items-center rounded-full px-2 text-[11px] font-semibold"
              style={{ background: "var(--color-primary-light)", color: "var(--color-primary-dark)" }}
            >
              {staff?.length ?? 0}
            </span>
          </div>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Manage clinic employees and healthcare providers.
          </p>
        </div>
        <Link href="/staff/new">
          <Button size="default">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add Staff
          </Button>
        </Link>
      </div>

      {error && (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ background: "var(--color-danger-light)", borderColor: "rgba(239,68,68,0.2)", color: "var(--color-danger-dark)" }}
        >
          Failed to load staff: {error.message}
        </div>
      )}

      <Card>
        <CardHeader
          className="flex flex-row items-center justify-between space-y-0 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--color-muted-foreground)" }} />
              <input
                type="text"
                placeholder="Search staff…"
                className="header-search-input"
                style={{ paddingLeft: "36px" }}
              />
            </div>
            <Button variant="outline" size="icon" title="Filter">
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
            {staff?.length ?? 0} total
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {!staff || staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center" style={{ color: "var(--color-muted-foreground)" }}>
              <UserCog className="h-10 w-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No staff members found</p>
              <p className="text-xs mt-1">Add your first staff member to get started.</p>
              <Link href="/staff/new" className="mt-4">
                <Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Staff</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Staff Member", "Role", "Contact", ""].map((col) => (
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
                  {staff.map((employee) => {
                    const initials = getInitials(employee.first_name, employee.last_name)
                    const { bg, text } = colorForName(`${employee.first_name}${employee.last_name}`)
                    return (
                      <tr key={employee.id} className="table-row-hover">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                              style={{ background: bg, color: text }}
                            >
                              {initials}
                            </div>
                            <p className="font-medium text-sm" style={{ color: "var(--color-foreground)" }}>
                              {employee.last_name}, {employee.first_name}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><Badge variant="info">{employee.role}</Badge></td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                          {employee.contact_number || "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="ghost" size="icon-sm" title="Edit">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
