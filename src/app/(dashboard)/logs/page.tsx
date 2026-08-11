import { PageHeader } from "@/components/ui/PageHeader"
import { ActivityFeed, ActivityLog } from "@/components/ui/ActivityFeed"
import { LogsMetricsCharts } from "@/components/ui/LogsMetricsCharts"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { TabLinks } from "@/components/ui/Tabs"
import { SearchInput } from "@/components/ui/SearchInput"
import { Pagination } from "@/components/ui/Pagination"
import { Button } from "@/components/ui/Button"
import { Filter, Calendar } from "lucide-react"

export default async function LogsPage(props: {
  searchParams?: Promise<{ tab?: string; query?: string; page?: string }>
}) {
  const searchParams = await props.searchParams
  const activeTab = searchParams?.tab ?? "all"
  const query = searchParams?.query?.toLowerCase() || ""
  const page = parseInt(searchParams?.page || "1")
  const pageSize = 10

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: dbLogs, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })

  const logs = !error && dbLogs ? dbLogs : []

  // Compute metrics for the bento grid
  let added = 0
  let edited = 0
  let deleted = 0

  logs.forEach(log => {
    const action = log.action.toLowerCase()
    if (action.includes("deleted")) {
      deleted++
    } else if (action.includes("updated") || action.includes("edited") || action.includes("modified")) {
      edited++
    } else {
      // "Registered", "Logged", "Created", "Administered", etc.
      added++
    }
  })

  // Filter logs based on activeTab
  let filteredLogs = logs
  if (activeTab === "added") {
    filteredLogs = logs.filter(log => !log.action.toLowerCase().includes("deleted") && !log.action.toLowerCase().includes("updated") && !log.action.toLowerCase().includes("edited") && !log.action.toLowerCase().includes("modified"))
  } else if (activeTab === "edited") {
    filteredLogs = logs.filter(log => log.action.toLowerCase().includes("updated") || log.action.toLowerCase().includes("edited") || log.action.toLowerCase().includes("modified"))
  } else if (activeTab === "deleted") {
    filteredLogs = logs.filter(log => log.action.toLowerCase().includes("deleted"))
  }

  // Filter by query
  if (query) {
    filteredLogs = filteredLogs.filter(log => 
      log.action.toLowerCase().includes(query) || 
      log.target.toLowerCase().includes(query) ||
      log.user_name.toLowerCase().includes(query)
    )
  }

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / pageSize)
  const paginatedLogs = filteredLogs.slice((page - 1) * pageSize, page * pageSize)

  const tabs = [
    { key: "all", label: "All activity", count: logs.length },
    { key: "added", label: "Added", count: added },
    { key: "edited", label: "Edited", count: edited },
    { key: "deleted", label: "Deleted", count: deleted },
  ]

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out">
      <div className="flex flex-col gap-4">
        <PageHeader
          title="Activity Logs"
          description="View your team's trades and transactions."
        />
        <div className="border-b" style={{ borderColor: "#eaecf0" }}>
          <TabLinks tabs={tabs} activeKey={activeTab} basePath="/logs" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Main Bento Box: Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <div className="flex-1 w-full relative">
              <SearchInput placeholder="Search logs..." />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 pointer-events-none hidden sm:block">
                ⌘K
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none">
                <Calendar className="h-4 w-4 text-gray-500" />
                Select dates
              </Button>
              <Button variant="outline" className="gap-2 bg-white flex-1 sm:flex-none">
                <Filter className="h-4 w-4 text-gray-500" />
                Filters
              </Button>
            </div>
          </div>
          
          <ActivityFeed logs={paginatedLogs as ActivityLog[]} />

          {totalPages > 1 && (
            <div className="bg-white rounded-xl border p-2" style={{ borderColor: "#eaecf0" }}>
              <Pagination currentPage={page} totalPages={totalPages} />
            </div>
          )}
        </div>

        {/* Side Bento Box: Charts and Stats */}
        <div className="lg:col-span-1 h-full">
          <div className="sticky top-6">
            <LogsMetricsCharts added={added} edited={edited} deleted={deleted} />
          </div>
        </div>
      </div>
    </div>
  )
}
