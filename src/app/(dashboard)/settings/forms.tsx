"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { Save, User, Building2, Palette, Loader2 } from "lucide-react"
import { updateProfile, updatePreferences, updateBarangayInfo } from "./actions"

const ProfileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
})

const PreferencesSchema = z.object({
  theme: z.string(),
  language: z.string(),
  notifications: z.string(),
})

const BarangaySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  municipality: z.string().min(2, "Municipality is required."),
  contact: z.string().min(5, "Contact number is required."),
  address: z.string().min(5, "Address is required."),
})

export function ProfileForm({ initialData }: { initialData: { fullName: string, email: string, role: string } }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName: initialData.fullName,
      email: initialData.email,
    },
  })

  const onSubmit = async (data: z.infer<typeof ProfileSchema>) => {
    setIsPending(true)
    setMessage(null)
    const result = await updateProfile(data)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Profile updated successfully." })
    }
    setIsPending(false)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <User className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>Update your account profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...register("fullName")} />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" defaultValue={initialData.role || "Healthcare Worker"} disabled />
          </div>
          {message && (
            <div className={`p-3 text-sm rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-[var(--color-border)] px-6 py-4">
          <Button type="submit" disabled={isPending} className="flex items-center gap-2 w-full sm:w-auto">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function PreferencesForm({ initialData }: { initialData: { theme: string, language: string, notifications: string } }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof PreferencesSchema>>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: z.infer<typeof PreferencesSchema>) => {
    setIsPending(true)
    setMessage(null)
    const result = await updatePreferences(data)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Preferences updated successfully." })
    }
    setIsPending(false)
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Palette className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>System Preferences</CardTitle>
          </div>
          <CardDescription>Customize your application experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select id="theme" {...register("theme")}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </Select>
            {errors.theme && <p className="text-sm text-red-500">{errors.theme.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select id="language" {...register("language")}>
              <option value="en">English</option>
              <option value="tl">Tagalog</option>
            </Select>
            {errors.language && <p className="text-sm text-red-500">{errors.language.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="notifications">Email Notifications</Label>
            <Select id="notifications" {...register("notifications")}>
              <option value="all">All notifications</option>
              <option value="important">Important only</option>
              <option value="none">None</option>
            </Select>
            {errors.notifications && <p className="text-sm text-red-500">{errors.notifications.message}</p>}
          </div>
          {message && (
            <div className={`p-3 text-sm rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-[var(--color-border)] px-6 py-4">
          <Button type="submit" disabled={isPending} className="flex items-center gap-2 w-full sm:w-auto">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export function BarangayForm({ initialData }: { initialData: { name: string, municipality: string, contact: string, address: string } }) {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof BarangaySchema>>({
    resolver: zodResolver(BarangaySchema),
    defaultValues: initialData,
  })

  const onSubmit = async (data: z.infer<typeof BarangaySchema>) => {
    setIsPending(true)
    setMessage(null)
    const result = await updateBarangayInfo(data)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Barangay info updated successfully." })
    }
    setIsPending(false)
  }

  return (
    <Card className="md:col-span-2">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Barangay Information</CardTitle>
          </div>
          <CardDescription>Update the details of your barangay health center.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brgy-name">Barangay Name</Label>
              <Input id="brgy-name" {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="municipality">Municipality / City</Label>
              <Input id="municipality" {...register("municipality")} />
              {errors.municipality && <p className="text-sm text-red-500">{errors.municipality.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" {...register("contact")} />
              {errors.contact && <p className="text-sm text-red-500">{errors.contact.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
          </div>
          {message && (
            <div className={`p-3 text-sm rounded-md ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-[var(--color-border)] px-6 py-4">
          <Button type="submit" disabled={isPending} className="flex items-center gap-2 w-full sm:w-auto">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Update Information
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
