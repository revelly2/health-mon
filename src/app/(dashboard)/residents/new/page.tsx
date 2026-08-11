import { FormClient } from "./FormClient"

export default function NewResidentPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Register Resident</h2>
        <p className="text-[var(--color-muted-foreground)]">Add a new resident to the barangay database.</p>
      </div>

      <FormClient />
    </div>
  )
}
