"use client";

import { useState } from "react";
import { createVaccination } from "../actions";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Save, User, Syringe } from "lucide-react";

export function FormClient({ residents }: { residents: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createVaccination(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit}>
      {error && (
        <div className="rounded-md bg-[var(--color-danger-light)] p-4 text-sm text-[var(--color-danger)] font-medium mb-6">
          {error}
        </div>
      )}

      <Stepper 
        onFinalStepCompleted={() => {}} // Form submission handles this
        nextButtonProps={{ disabled: isLoading }}
        nextButtonText="Continue"
      >
        <Step>
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Patient & Staff Selection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="resident_id">Select Patient <span className="text-[var(--color-danger)]">*</span></Label>
                  <Select id="resident_id" name="resident_id" required defaultValue="">
                    <option value="" disabled>-- Select a registered resident --</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.last_name}, {r.first_name} (DOB: {new Date(r.date_of_birth).toLocaleDateString()})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>

        <Step>
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Syringe className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Vaccine Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vaccine_name">Vaccine Name <span className="text-[var(--color-danger)]">*</span></Label>
                  <Input id="vaccine_name" name="vaccine_name" required placeholder="e.g. COVID-19, Polio, MMR" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dose_number">Dose Number</Label>
                  <Input id="dose_number" name="dose_number" type="number" min="1" defaultValue="1" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="next_due_date">Next Due Date (Optional)</Label>
                  <Input id="next_due_date" name="next_due_date" type="date" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Any adverse reactions or general notes..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>
      </Stepper>
    </form>
  )
}
