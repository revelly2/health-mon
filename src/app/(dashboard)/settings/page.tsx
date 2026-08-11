import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { ProfileForm, PreferencesForm, BarangayForm } from "./forms"

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  let profileData = {
    fullName: "Admin User",
    email: "admin@barangay.gov.ph",
    role: "Healthcare Worker"
  }

  let preferencesData = {
    theme: "system",
    language: "en",
    notifications: "important"
  }

  if (user) {
    profileData.email = user.email || profileData.email
    profileData.fullName = user.user_metadata?.full_name || profileData.fullName

    // Try to get role from employees table if needed, or stick with user_metadata/default
    const { data: employeeData } = await supabase
      .from("employees")
      .select("role")
      .eq("email", user.email)
      .single()
    
    if (employeeData?.role) {
      profileData.role = employeeData.role
    }

    if (user.user_metadata?.preferences) {
      preferencesData = { ...preferencesData, ...user.user_metadata.preferences }
    }
  }

  let barangayData = {
    name: "San Jose",
    municipality: "Quezon City",
    contact: "+63 912 345 6789",
    address: "123 Health Center St."
  }

  const { data: sysSettings, error: sysError } = await supabase
    .from("system_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (sysSettings) {
    barangayData = {
      name: sysSettings.barangay_name || barangayData.name,
      municipality: sysSettings.municipality || barangayData.municipality,
      contact: sysSettings.contact_number || barangayData.contact,
      address: sysSettings.address || barangayData.address
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Settings</h2>
        <p className="text-[var(--color-muted-foreground)]">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProfileForm initialData={profileData} />
        <PreferencesForm initialData={preferencesData} />
        <BarangayForm initialData={barangayData} />
      </div>
    </div>
  )
}
