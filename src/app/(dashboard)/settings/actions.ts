"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"
import { z } from "zod"

const ProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
})

export async function updateProfile(data: z.infer<typeof ProfileSchema>) {
  const result = ProfileSchema.safeParse(data)
  if (!result.success) {
    return { error: "Validation failed." }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error: updateError } = await supabase.auth.updateUser({
    email: data.email,
    data: { full_name: data.fullName }
  })

  if (updateError) {
    return { error: updateError.message }
  }

  // Ensure profiles table is also updated, as triggers might not be reliable
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { error: profileError } = await supabase.from("profiles").upsert({ 
      id: user.id, 
      full_name: data.fullName 
    })
    
    if (profileError) {
      return { error: `Failed to update profiles table: ${profileError.message}` }
    }
  }

  revalidatePath("/settings")
  return { success: true }
}

const PreferencesSchema = z.object({
  theme: z.string(),
  language: z.string(),
  notifications: z.string(),
})

export async function updatePreferences(data: z.infer<typeof PreferencesSchema>) {
  const result = PreferencesSchema.safeParse(data)
  if (!result.success) {
    return { error: "Validation failed." }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.updateUser({
    data: {
      preferences: {
        theme: data.theme,
        language: data.language,
        notifications: data.notifications,
      }
    }
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}

const BarangaySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  municipality: z.string().min(2, "Municipality is required."),
  contact: z.string().min(5, "Contact number is required."),
  address: z.string().min(5, "Address is required."),
})

export async function updateBarangayInfo(data: z.infer<typeof BarangaySchema>) {
  const result = BarangaySchema.safeParse(data)
  if (!result.success) {
    return { error: "Validation failed." }
  }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Upsert the system settings (assuming id 1 is the main config)
  const { error } = await supabase
    .from("system_settings")
    .upsert({
      id: 1,
      barangay_name: data.name,
      municipality: data.municipality,
      contact_number: data.contact,
      address: data.address
    })

  if (error) {
    // If the table doesn't exist, we'll return the error
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { success: true }
}
