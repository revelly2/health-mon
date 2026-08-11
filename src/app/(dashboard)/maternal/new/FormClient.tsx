"use client";

import { useState } from "react";
import { createMaternalCare } from "../actions";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Save, User, Baby } from "lucide-react";

export function FormClient({ residents }: { residents: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createMaternalCare(formData);
    
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
                <CardTitle className="text-lg">Mother Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="max-w-xl">
                <div className="space-y-2">
                  <Label htmlFor="resident_id">Select Patient <span className="text-[var(--color-danger)]">*</span></Label>
                  <Select id="resident_id" name="resident_id" required defaultValue="">
                    <option value="" disabled>-- Select a registered female resident --</option>
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
                <Baby className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Fetal & Maternal Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="trimester">Trimester <span className="text-[var(--color-danger)]">*</span></Label>
                  <Select id="trimester" name="trimester" required defaultValue="1">
                    <option value="1">1st Trimester (Week 1 - 12)</option>
                    <option value="2">2nd Trimester (Week 13 - 27)</option>
                    <option value="3">3rd Trimester (Week 28 - 40+)</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fetal_heart_rate">Fetal Heart Rate (bpm)</Label>
                  <Input id="fetal_heart_rate" name="fetal_heart_rate" type="number" placeholder="e.g. 140" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fundal_height">Fundal Height (cm)</Label>
                  <Input id="fundal_height" name="fundal_height" type="number" step="0.1" placeholder="e.g. 25" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="General observations, mother's complaints, prescribed supplements..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>
      </Stepper>
    </form>
  )
}
