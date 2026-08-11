"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createVaccination(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to record a vaccination." };
  }

  const resident_id = formData.get("resident_id") as string;
  const administered_by = user.id;
  const vaccine_name = formData.get("vaccine_name") as string;
  const doseStr = formData.get("dose_number") as string;
  const dose_number = doseStr ? parseInt(doseStr) : 1;
  const next_due_date = (formData.get("next_due_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!resident_id || !vaccine_name) {
    return { error: "Resident and Vaccine Name are required." };
  }

  const { error } = await supabase
    .from("vaccinations")
    .insert({
      resident_id,
      administered_by,
      vaccine_name,
      dose_number,
      next_due_date,
      notes,
      date_administered: new Date().toISOString()
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

  const { error: logError } = await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Administered vaccine to",
    target: residentName,
    labels: [vaccine_name],
    attachment_type: notes ? "details" : null,
    attachment_name: notes || null
  });

  if (logError) {
    return { error: `Failed to create activity log: ${logError.message}. Did you run the SQL schema?` };
  }

  revalidatePath("/vaccinations");
  revalidatePath("/");
  redirect("/vaccinations");
}

export async function deleteVaccination(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch record info before deleting
  const { data: existing } = await supabase
    .from("vaccinations")
    .select("vaccine_name, residents ( first_name, last_name )")
    .eq("id", id)
    .single();

  const res = (existing as any)?.residents;
  const patientName = res ? `${res.first_name} ${res.last_name}` : "a patient";
  const vaccineName = (existing as any)?.vaccine_name || "vaccine";
  const userName = user.user_metadata?.full_name || "Staff Member";

  const { error } = await supabase
    .from("vaccinations")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Deleted vaccination record for",
    target: patientName,
    labels: [vaccineName, "Deleted"],
    attachment_type: null,
    attachment_name: null,
  });

  revalidatePath("/vaccinations");
  revalidatePath("/");
  return { success: true };
}

export async function updateVaccination(id: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const vaccine_name = (formData.get("vaccine_name") as string) || null;
  const doseStr = formData.get("dose_number") as string;
  const dose_number = doseStr ? parseInt(doseStr) : null;
  const next_due_date = (formData.get("next_due_date") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  if (!vaccine_name) return { error: "Vaccine name is required." };

  // Fetch patient name for log
  const { data: existing } = await supabase
    .from("vaccinations")
    .select("residents ( first_name, last_name )")
    .eq("id", id)
    .single();

  const res = (existing as any)?.residents;
  const patientName = res ? `${res.first_name} ${res.last_name}` : "a patient";
  const userName = user.user_metadata?.full_name || "Staff Member";

  const { error } = await supabase
    .from("vaccinations")
    .update({ vaccine_name, dose_number, next_due_date, notes })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Updated vaccination record for",
    target: patientName,
    labels: [vaccine_name],
    attachment_type: notes ? "details" : null,
    attachment_name: notes || null,
  });

  revalidatePath("/vaccinations");
  revalidatePath("/");
  return { success: true };
}
