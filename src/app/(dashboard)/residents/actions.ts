"use server"

import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function createResident(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const first_name = formData.get("first_name")?.toString()
  const last_name = formData.get("last_name")?.toString()
  const date_of_birth = formData.get("date_of_birth")?.toString()
  const gender = formData.get("gender")?.toString()
  const priority_group = formData.get("priority_group")?.toString()

  const address = formData.get("address")?.toString()
  const latString = formData.get("latitude")?.toString()
  const lngString = formData.get("longitude")?.toString()
  
  const latitude = latString ? parseFloat(latString) : null
  const longitude = lngString ? parseFloat(lngString) : null

  if (!first_name || !last_name || !date_of_birth || !gender || !priority_group) {
    return { error: "Missing required fields." }
  }

  const { error } = await supabase
    .from("residents")
    .insert({
      first_name,
      last_name,
      date_of_birth,
      gender,
      priority_group,
      address,
      latitude,
      longitude
    })

  if (error) {
    return { error: error.message }
  }
  const { data: { user } } = await supabase.auth.getUser()
  const userName = user?.user_metadata?.full_name || "Staff Member"

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Registered new resident",
    target: `${first_name} ${last_name}`,
    labels: [priority_group],
    attachment_type: null,
    attachment_name: null,
  })

  redirect("/residents")
}

export async function deleteResident(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }
  // Fetch resident name before deleting
  const { data: existing } = await supabase
    .from("residents")
    .select("first_name, last_name")
    .eq("id", id)
    .single()

  const residentName = existing ? `${existing.first_name} ${existing.last_name}` : "a resident"
  const userName = user.user_metadata?.full_name || "Staff Member"

  const { error } = await supabase
    .from("residents")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Deleted resident",
    target: residentName,
    labels: ["Deleted"],
    attachment_type: null,
    attachment_name: null,
  })

  const { revalidatePath } = await import("next/cache")
  revalidatePath("/residents")
  revalidatePath("/")
  return { success: true }
}

export async function updateResident(id: string, formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const first_name = formData.get("first_name")?.toString()
  const last_name = formData.get("last_name")?.toString()
  const date_of_birth = formData.get("date_of_birth")?.toString()
  const gender = formData.get("gender")?.toString()
  const priority_group = formData.get("priority_group")?.toString()
  const address = formData.get("address")?.toString()

  if (!first_name || !last_name || !date_of_birth || !gender || !priority_group) {
    return { error: "Missing required fields." }
  }

  const { error } = await supabase
    .from("residents")
    .update({ first_name, last_name, date_of_birth, gender, priority_group, address })
    .eq("id", id)

  if (error) return { error: error.message }

  const userName = user.user_metadata?.full_name || "Staff Member"

  await supabase.from("activity_logs").insert({
    user_name: userName,
    action: "Updated resident profile for",
    target: `${first_name} ${last_name}`,
    labels: [priority_group],
    attachment_type: null,
    attachment_name: null,
  })

  const { revalidatePath } = await import("next/cache")
  revalidatePath("/residents")
  revalidatePath("/")
  return { success: true }
}
