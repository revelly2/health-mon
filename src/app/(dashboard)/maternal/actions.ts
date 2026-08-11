"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function createMaternalCare(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in to record a maternal care visit." };
  }

  const resident_id = formData.get("resident_id") as string;
  const midwife_id = user.id;
  const trimesterStr = formData.get("trimester") as string;
  const trimester = trimesterStr ? parseInt(trimesterStr) : null;
  const fhrStr = formData.get("fetal_heart_rate") as string;
  const fetal_heart_rate = fhrStr ? parseInt(fhrStr) : null;
  const fhStr = formData.get("fundal_height") as string;
  const fundal_height = fhStr ? parseFloat(fhStr) : null;
  const notes = (formData.get("notes") as string) || null;

  if (!resident_id || !trimester) {
    return { error: "Resident and Trimester are required." };
  }

  const { error } = await supabase
    .from("maternal_care_logs")
    .insert({
      resident_id,
      midwife_id,
      trimester,
      fetal_heart_rate,
      fundal_height,
      notes
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
    action: "Logged maternal care for",
    target: residentName,
    labels: [`Trimester ${trimester}`],
    attachment_type: notes ? "details" : null,
    attachment_name: notes || null
  });

  revalidatePath("/maternal");
  redirect("/maternal");
}

export async function deleteMaternalRecord(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Fetch record info before deleting
  const { data: existing } = await supabase
    .from("maternal_care_logs")
    .select("trimester, residents ( first_name, last_name )")
    .eq("id", id)
    .single();

  const res = (existing as any)?.residents;
  const patientName = res ? `${res.first_name} ${res.last_name}` : "a patient";
  const trimester = (existing as any)?.trimester;
  const userName = user.user_metadata?.full_name || "Staff Member";

  const { error } = await supabase
    .from("maternal_care_logs")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Deleted maternal care log for",
    target: patientName,
    labels: trimester ? [`Trimester ${trimester}`, "Deleted"] : ["Deleted"],
    attachment_type: null,
    attachment_name: null,
  });

  revalidatePath("/maternal");
  revalidatePath("/");
  return { success: true };
}

export async function updateMaternalRecord(id: string, formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const trimesterStr = formData.get("trimester") as string;
  const trimester = trimesterStr ? parseInt(trimesterStr) : null;
  const fhrStr = formData.get("fetal_heart_rate") as string;
  const fetal_heart_rate = fhrStr ? parseInt(fhrStr) : null;
  const fhStr = formData.get("fundal_height") as string;
  const fundal_height = fhStr ? parseFloat(fhStr) : null;
  const notes = (formData.get("notes") as string) || null;

  if (!trimester) return { error: "Trimester is required." };

  // Fetch patient name for log
  const { data: existing } = await supabase
    .from("maternal_care_logs")
    .select("residents ( first_name, last_name )")
    .eq("id", id)
    .single();

  const res = (existing as any)?.residents;
  const patientName = res ? `${res.first_name} ${res.last_name}` : "a patient";
  const userName = user.user_metadata?.full_name || "Staff Member";

  const { error } = await supabase
    .from("maternal_care_logs")
    .update({ trimester, fetal_heart_rate, fundal_height, notes })
    .eq("id", id);

  if (error) return { error: error.message };

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Updated maternal care log for",
    target: patientName,
    labels: [`Trimester ${trimester}`],
    attachment_type: notes ? "details" : null,
    attachment_name: notes || null,
  });

  revalidatePath("/maternal");
  revalidatePath("/");
  return { success: true };
}
