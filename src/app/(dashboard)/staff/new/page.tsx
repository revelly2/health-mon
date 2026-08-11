import { FormClient } from "./FormClient"

export default function NewStaffPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Add New Staff</h2>
        <p className="text-[var(--color-muted-foreground)]">Register a new employee in the clinic.</p>
      </div>

      <FormClient />
    </div>
  )
}
