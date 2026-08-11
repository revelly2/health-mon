"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

function calculateRiskLevel(bp: string | null, hr: number | null): "High" | "Moderate" | "Low" {
  let isHighRisk = false;
  let isModerateRisk = false;

  // Basic Blood Pressure parsing (e.g. "120/80")
  if (bp && bp.includes("/")) {
    const [sys, dia] = bp.split("/").map(Number);
    if (!isNaN(sys) && !isNaN(dia)) {
      if (sys >= 140 || dia >= 90) isHighRisk = true;
      else if (sys >= 130 || dia >= 80) isModerateRisk = true;
    }
  }

  // Basic Heart Rate checking
  if (hr) {
    if (hr > 100 || hr < 50) isHighRisk = true;
    else if (hr > 90 || hr < 60) isModerateRisk = true;
  }

  if (isHighRisk) return "High";
  if (isModerateRisk) return "Moderate";
  return "Low";
}

export async function createHealthRecord(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get current user to attach as recorder
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to create a record." };
  }

  // Parse Form Data
  const resident_id = formData.get("resident_id") as string;
  const recorder_id = user.id;
  const blood_pressure = (formData.get("blood_pressure") as string) || null;
  
  const hrStr = formData.get("heart_rate") as string;
  const heart_rate = hrStr ? parseInt(hrStr) : null;
  
  const tempStr = formData.get("temperature") as string;
  const temperature = tempStr ? parseFloat(tempStr) : null;
  
  const weightStr = formData.get("weight") as string;
  const weight = weightStr ? parseFloat(weightStr) : null;
  
  const heightStr = formData.get("height") as string;
  const height = heightStr ? parseFloat(heightStr) : null;
  
  const chief_complaint = (formData.get("chief_complaint") as string) || null;
  const diagnosis = (formData.get("diagnosis") as string) || null;
  const treatment = (formData.get("treatment") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  // Validate required fields
  if (!resident_id) {
    return { error: "Please select a patient." };
  }

  // Auto-calculate risk
  const risk_level = calculateRiskLevel(blood_pressure, heart_rate);

  // Insert into DB
  const { error } = await supabase
    .from("health_records")
    .insert({
      resident_id,
      recorder_id,
      blood_pressure,
      heart_rate,
      temperature,
      weight,
      height,
      chief_complaint,
      diagnosis,
      treatment,
      notes,
      risk_level
    });

  if (error) {
    return { error: error.message };
  }

  // Get resident info for the activity log target
  const { data: resident } = await supabase
    .from("residents")
    .select("first_name, last_name")
    .eq("id", resident_id)
    .single();

  const residentName = resident ? `${resident.first_name} ${resident.last_name}` : "a patient";
  const userName = user.user_metadata?.full_name || "Staff Member";

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Recorded health checkup for",
    target: residentName,
    labels: [risk_level],
    attachment_type: notes ? "details" : null,
    attachment_name: notes || null
  });

  revalidatePath("/records");
  revalidatePath("/"); // Update dashboard stats too
  redirect("/records");
}

export async function deleteHealthRecord(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch record + patient name before deleting
  const { data: existing } = await supabase
    .from("health_records")
    .select("residents ( first_name, last_name )")
    .eq("id", id)
    .single();

  const res = (existing as any)?.residents;
  const patientName = res ? `${res.first_name} ${res.last_name}` : "a patient";
  const userName = user.user_metadata?.full_name || "Staff Member";

  const { error } = await supabase
    .from("health_records")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Deleted health record for",
    target: patientName,
    labels: ["Deleted"],
    attachment_type: null,
    attachment_name: null,
  });

  revalidatePath("/records");
  revalidatePath("/");
  return { success: true };
}

export async function updateHealthRecord(id: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const blood_pressure = (formData.get("blood_pressure") as string) || null;
  const hrStr = formData.get("heart_rate") as string;
  const heart_rate = hrStr ? parseInt(hrStr) : null;
  const tempStr = formData.get("temperature") as string;
  const temperature = tempStr ? parseFloat(tempStr) : null;
  const weightStr = formData.get("weight") as string;
  const weight = weightStr ? parseFloat(weightStr) : null;
  const chief_complaint = (formData.get("chief_complaint") as string) || null;
  const diagnosis = (formData.get("diagnosis") as string) || null;
  const treatment = (formData.get("treatment") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const risk_level = calculateRiskLevel(blood_pressure, heart_rate);

  // Fetch patient name for log
  const { data: existing } = await supabase
    .from("health_records")
    .select("residents ( first_name, last_name )")
    .eq("id", id)
    .single();

  const res = (existing as any)?.residents;
  const patientName = res ? `${res.first_name} ${res.last_name}` : "a patient";
  const userName = user.user_metadata?.full_name || "Staff Member";

  const { error } = await supabase
    .from("health_records")
    .update({ blood_pressure, heart_rate, temperature, weight, chief_complaint, diagnosis, treatment, notes, risk_level })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Updated health record for",
    target: patientName,
    labels: [risk_level],
    attachment_type: notes ? "details" : null,
    attachment_name: notes || null,
  });

  revalidatePath("/records");
  revalidatePath("/");
  return { success: true };
}
