"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createResident } from "../actions";
import Stepper, { Step } from "@/components/ui/Stepper";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Save, User, MapPin } from "lucide-react";

const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-[var(--color-muted)] flex items-center justify-center rounded-md">Loading Map...</div>
});

export function FormClient() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Track location manually so we can include it in the form
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  async function handleSubmit(formData: FormData) {
    if (location) {
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
    }

    setIsLoading(true);
    setError(null);
    const result = await createResident(formData);
    
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
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name <span className="text-[var(--color-danger)]">*</span></Label>
                  <Input id="first_name" name="first_name" required placeholder="e.g. Juan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name <span className="text-[var(--color-danger)]">*</span></Label>
                  <Input id="last_name" name="last_name" required placeholder="e.g. Dela Cruz" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth <span className="text-[var(--color-danger)]">*</span></Label>
                  <Input id="date_of_birth" name="date_of_birth" type="date" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender <span className="text-[var(--color-danger)]">*</span></Label>
                  <Select id="gender" name="gender" required defaultValue="">
                    <option value="" disabled>-- Select gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="priority_group">Priority Group <span className="text-[var(--color-danger)]">*</span></Label>
                  <Select id="priority_group" name="priority_group" required defaultValue="General">
                    <option value="General">General Population</option>
                    <option value="A1">A1: Healthcare Workers</option>
                    <option value="A2">A2: Senior Citizens</option>
                    <option value="A3">A3: Persons with Comorbidities</option>
                    <option value="A4">A4: Essential Personnel</option>
                    <option value="A5">A5: Indigent Population</option>
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
                <MapPin className="h-5 w-5 text-[var(--color-primary)]" />
                <CardTitle className="text-lg">Location Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Home Address</Label>
                  <Input id="address" name="address" placeholder="e.g. 123 Main St, Brgy. San Jose" />
                </div>
                
                <div className="space-y-2">
                  <Label>Pin Location</Label>
                  <p className="text-sm text-[var(--color-muted-foreground)]">Click on the map to pin the resident's exact home location.</p>
                  <div className="h-[300px] w-full border border-[var(--color-border)] rounded-md overflow-hidden relative z-0">
                    <MapComponent 
                      onLocationSelect={(lat, lng) => setLocation({lat, lng})} 
                      defaultLocation={location || undefined}
                    />
                  </div>
                  {location && (
                    <p className="text-xs text-[var(--color-primary)] font-medium">
                      Location pinned: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Step>
      </Stepper>
    </form>
  )
}
