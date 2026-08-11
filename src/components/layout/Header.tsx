import { Bell, Search, LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { logout } from "@/app/login/actions"
import HeaderSearch from "./HeaderSearch"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export async function Header() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const fullName = user?.user_metadata?.full_name || "User"
  const role = user?.user_metadata?.role || "Staff"
  const initials = getInitials(fullName)

  return (
    <header
      className="sticky top-0 z-10 flex h-14 flex-shrink-0 items-center justify-between px-6 header-bar"
    >
      {/* Left: search (client component for focus interactivity) */}
      <div className="flex items-center flex-1 max-w-sm">
        <HeaderSearch />
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Notification bell */}
        <button
          className="header-icon-btn"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* Divider */}
        <div className="header-divider" />

        {/* User info */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <p className="header-username">{fullName}</p>
            <p className="header-role">{role}</p>
          </div>

          {/* Initials avatar */}
          <div className="header-avatar">{initials}</div>

          {/* Logout */}
          <form action={logout}>
            <button
              title="Sign Out"
              className="header-logout-btn"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
