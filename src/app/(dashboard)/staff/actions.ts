"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export async function createStaff(formData: FormData) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "You must be logged in to add staff." }
  }

  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const role = formData.get("role") as string
  const contact_number = (formData.get("contact_number") as string) || null

  if (!first_name || !last_name || !role) {
    return { error: "First Name, Last Name, and Role are required." }
  }

  const { error } = await supabase
    .from("employees")
    .insert({
      first_name,
      last_name,
      role,
      contact_number
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/staff")
  return { success: true }
}
