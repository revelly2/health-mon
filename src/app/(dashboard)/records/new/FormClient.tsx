"use client";

import { useState } from "react";
import { createHealthRecord } from "../actions";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Save, User, Activity, FileText } from "lucide-react";

export function FormClient({ residents }: { residents: any[] }) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await createHealthRecord(formData);
    
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
          {/* Patient & Staff Selection */}
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Patient & Staff Information</CardTitle>
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
          {/* Vital Signs */}
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Vital Signs</CardTitle>
              </div>
              <CardDescription>
                Risk level will be automatically calculated based on Blood Pressure and Heart Rate.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="blood_pressure">Blood Pressure</Label>
                  <Input id="blood_pressure" name="blood_pressure" placeholder="e.g. 120/80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heart_rate">Heart Rate (bpm)</Label>
                  <Input id="heart_rate" name="heart_rate" type="number" placeholder="e.g. 75" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input id="temperature" name="temperature" type="number" step="0.1" placeholder="e.g. 36.5" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input id="weight" name="weight" type="number" step="0.1" placeholder="e.g. 65" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>

        <Step>
          {/* Clinical Notes */}
          <Card>
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Clinical Notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="chief_complaint">Chief Complaint</Label>
                  <Input id="chief_complaint" name="chief_complaint" placeholder="Why is the patient visiting today?" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Textarea id="diagnosis" name="diagnosis" placeholder="Clinical diagnosis..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment Plan</Label>
                    <Textarea id="treatment" name="treatment" placeholder="Prescribed medications, procedures..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea id="notes" name="notes" placeholder="Any other observations..." />
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>
      </Stepper>
    </form>
  )
}
