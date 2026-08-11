"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Stepper, { Step } from "@/components/ui/Stepper"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { User, Phone } from "lucide-react"
import { createStaff } from "../actions"

export function FormClient() {
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(null)

    const result = await createStaff(formData)
    
    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      router.push("/staff")
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div className="p-4 bg-[var(--color-danger-light)] text-[var(--color-danger)] rounded-md border border-[var(--color-danger)]/20 mb-6">
          {error}
        </div>
      )}

      <Stepper 
        onFinalStepCompleted={() => {}} // Form submission handles this
        nextButtonProps={{ disabled: isSubmitting }}
        nextButtonText="Continue"
      >
        <Step>
          <Card>
            <CardHeader className="bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-[var(--color-primary)]" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name <span className="text-[var(--color-danger)]">*</span></Label>
                  <Input id="first_name" name="first_name" required placeholder="e.g. Maria" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name <span className="text-[var(--color-danger)]">*</span></Label>
                  <Input id="last_name" name="last_name" required placeholder="e.g. Santos" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>

        <Step>
          <Card>
            <CardHeader className="bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-[var(--color-primary)]" />
                Role & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">Role / Position <span className="text-[var(--color-danger)]">*</span></Label>
                  <select 
                    id="role" 
                    name="role" 
                    required
                    className="flex h-10 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">-- Select Role --</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Midwife">Midwife</option>
                    <option value="Pharmacist">Pharmacist</option>
                    <option value="Med-Tech">Med-Tech</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-[var(--color-muted-foreground)]" />
                    <Input id="contact_number" name="contact_number" placeholder="09XX XXX XXXX" className="pl-9" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>
      </Stepper>
    </form>
  )
}
