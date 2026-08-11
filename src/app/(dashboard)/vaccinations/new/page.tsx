import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { FormClient } from "./FormClient"

export default async function NewVaccinationPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Fetch residents for the dropdown
  const { data: residents } = await supabase
    .from("residents")
    .select("id, first_name, last_name, date_of_birth")
    .order("last_name", { ascending: true })

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Log Vaccination</h2>
        <p className="text-[var(--color-muted-foreground)]">Record immunizations and schedule next doses.</p>
      </div>

      <FormClient residents={residents || []} />
    </div>
  )
}
