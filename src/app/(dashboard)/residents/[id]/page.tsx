import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Calendar, Users, FileText, ActivitySquare, Baby } from "lucide-react"
import MapWrapper from "./MapWrapper"

export default async function ResidentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Fetch Resident Data
  const { data: resident, error: residentError } = await supabase
    .from("residents")
    .select("*")
    .eq("id", id)
    .single()

  if (residentError || !resident) {
    notFound()
  }

  // 2. Fetch related data
  const [
    { data: healthRecords },
    { data: vaccinations },
    { data: maternalLogs }
  ] = await Promise.all([
    supabase.from("health_records").select("*").eq("resident_id", resident.id).order("checkup_date", { ascending: false }),
    supabase.from("vaccinations").select("*").eq("resident_id", resident.id).order("date_administered", { ascending: false }),
    resident.gender === 'Female' 
      ? supabase.from("maternal_care_logs").select("*").eq("resident_id", resident.id).order("checkup_date", { ascending: false })
      : Promise.resolve({ data: [] })
  ])

  // Calculate age
  const age = resident.date_of_birth ? Math.floor((new Date().getTime() - new Date(resident.date_of_birth).getTime()) / 3.15576e+10) : 'N/A'

  return (
    <div className="space-y-6 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">Resident Profile</h2>
        <p className="text-[var(--color-muted-foreground)]">Detailed information and medical history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Personal Info & Map */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="bg-[var(--color-muted)]/30 border-b border-[var(--color-border)]">
              <CardTitle className="text-xl">{resident.first_name} {resident.last_name}</CardTitle>
              <CardDescription>
                {resident.gender}, {age} years old
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="h-4 w-4 mt-0.5 text-[var(--color-muted-foreground)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">Date of Birth</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="h-4 w-4 mt-0.5 text-[var(--color-muted-foreground)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">Priority Group</p>
                  <Badge variant="outline" className="mt-1">{resident.priority_group || 'General'}</Badge>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-0.5 text-[var(--color-muted-foreground)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">Address</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {resident.address || 'No address provided'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Card */}
          {(resident.latitude && resident.longitude) && (
            <Card className="overflow-hidden">
              <CardHeader className="p-4 border-b border-[var(--color-border)] bg-[var(--color-muted)]/30">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location
                </CardTitle>
              </CardHeader>
              <div className="h-[250px] w-full relative z-0">
                <MapWrapper latitude={resident.latitude} longitude={resident.longitude} />
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Medical History */}
        <div className="md:col-span-2 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ActivitySquare className="h-5 w-5 text-[var(--color-primary)]" />
                Health Records
              </CardTitle>
              <CardDescription>General checkups and diagnoses.</CardDescription>
            </CardHeader>
            <CardContent>
              {healthRecords && healthRecords.length > 0 ? (
                <div className="space-y-4">
                  {healthRecords.map((record) => (
                    <div key={record.id} className="flex flex-col sm:flex-row sm:items-start justify-between p-4 border border-[var(--color-border)] rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium text-[var(--color-foreground)]">{record.chief_complaint || "Routine Checkup"}</p>
                        <p className="text-sm text-[var(--color-muted-foreground)]">{record.diagnosis || "No diagnosis specified"}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                          {record.checkup_date ? new Date(record.checkup_date).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      <Badge className="mt-2 sm:mt-0 w-fit" variant={record.risk_level === 'High' ? 'destructive' : record.risk_level === 'Moderate' ? 'warning' : 'success'}>
                        {record.risk_level} Risk
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)] p-4 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                  No health records found.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Vaccinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vaccinations && vaccinations.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {vaccinations.map((vax) => (
                    <div key={vax.id} className="p-3 border border-[var(--color-border)] rounded-lg flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{vax.vaccine_name}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)]">Dose: {vax.dose_number}</p>
                        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{vax.date_administered ? new Date(vax.date_administered).toLocaleDateString() : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--color-muted-foreground)] p-4 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                  No vaccinations on record.
                </p>
              )}
            </CardContent>
          </Card>

          {resident.gender === 'Female' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-pink-500" />
                  Maternal Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                {maternalLogs && maternalLogs.length > 0 ? (
                  <div className="space-y-4">
                    {maternalLogs.map((log) => (
                      <div key={log.id} className="p-4 border border-[var(--color-border)] rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">Trimester: {log.trimester}</p>
                            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                              Date: {log.checkup_date ? new Date(log.checkup_date).toLocaleDateString() : ''}
                            </p>
                          </div>
                          <Badge variant={log.high_risk_pregnancy ? "destructive" : "secondary"}>
                            {log.high_risk_pregnancy ? "High Risk" : "Normal"}
                          </Badge>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-[var(--color-muted-foreground)] mt-3 p-2 bg-[var(--color-muted)]/30 rounded">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-muted-foreground)] p-4 text-center border border-dashed border-[var(--color-border)] rounded-lg">
                    No maternal care records.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}
