"use client"

import { useState, useTransition } from "react"
import { Edit01, Trash01 } from "@untitledui/icons"
import { X, AlertTriangle, Save } from "lucide-react"
import { ButtonUtility } from "@/components/base/buttons/button-utility"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Select } from "@/components/ui/Select"
import { deleteResident, updateResident } from "./actions"
import { CopyButton } from "@/components/ui/CopyButton"

type Resident = {
  id: string
  name: string
  first_name?: string | null
  last_name?: string | null
  date_of_birth?: string | null
  gender?: string | null
  priority_group?: string | null
  address?: string | null
}

export function RowActions({ resident }: { resident: Resident }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleEdit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updateResident(resident.id, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditOpen(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteResident(resident.id)
      if (result?.error) {
        setError(result.error)
      } else {
        setDeleteOpen(false)
      }
    })
  }

  // Parse name for pre-filling (name is "Last, First" or "First Last" depending on data)
  const [lastName, ...firstParts] = resident.name.split(", ")
  const firstName = firstParts.join(", ") || ""

  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <CopyButton value={resident.name} tooltip="Copy resident name" />
          <ButtonUtility
            size="sm"
            color="secondary"
            tooltip="Edit resident"
            icon={Edit01}
            onClick={() => { setEditOpen(true); setError(null) }}
          />
          <ButtonUtility
            size="sm"
            color="danger"
            tooltip="Delete resident"
            icon={Trash01}
            onClick={() => { setDeleteOpen(true); setError(null) }}
          />
        </div>
      </td>

      {/* Edit Modal */}
      {editOpen && (
        <td className="p-0 border-0">
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false) }}
          >
            <div
              className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <h2 className="font-semibold text-base" style={{ color: "var(--color-foreground)" }}>Edit Resident</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{resident.name}</p>
                </div>
                <button
                  onClick={() => setEditOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-[var(--color-muted)] transition-colors"
                  style={{ color: "var(--color-muted-foreground)" }}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form */}
              <form action={handleEdit}>
                <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                  {error && (
                    <div className="rounded-lg px-4 py-3 text-sm font-medium" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}>
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-first">First Name <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                      <Input id="edit-first" name="first_name" required defaultValue={resident.first_name ?? firstName} placeholder="First name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-last">Last Name <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                      <Input id="edit-last" name="last_name" required defaultValue={resident.last_name ?? lastName} placeholder="Last name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-dob">Date of Birth <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                      <Input
                        id="edit-dob"
                        name="date_of_birth"
                        type="date"
                        required
                        defaultValue={resident.date_of_birth?.split("T")[0] ?? ""}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-gender">Gender <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                      <Select id="edit-gender" name="gender" required defaultValue={resident.gender ?? ""}>
                        <option value="" disabled>Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-priority">Priority Group <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                    <Select id="edit-priority" name="priority_group" required defaultValue={resident.priority_group ?? ""}>
                      <option value="" disabled>Select priority group</option>
                      <option value="Senior Citizen">Senior Citizen</option>
                      <option value="Pregnant Woman">Pregnant Woman</option>
                      <option value="Child">Child</option>
                      <option value="Person with Disability">Person with Disability</option>
                      <option value="General">General</option>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-address">Address</Label>
                    <Input id="edit-address" name="address" defaultValue={resident.address ?? ""} placeholder="Full address" />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-muted)" }}>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)} disabled={isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={isPending}>
                    <Save className="h-3.5 w-3.5" />
                    {isPending ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </td>
      )}

      {/* Delete Confirm Modal */}
      {deleteOpen && (
        <td className="p-0 border-0">
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false) }}
          >
            <div
              className="w-full max-w-sm rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--color-danger-light)" }}>
                  <AlertTriangle className="h-6 w-6" style={{ color: "var(--color-danger)" }} />
                </div>
                <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-foreground)" }}>Delete Resident?</h3>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  This will permanently delete <strong>{resident.name}</strong> and all their associated records. This action cannot be undone.
                </p>
                {error && (
                  <p className="mt-3 text-sm font-medium" style={{ color: "var(--color-danger)" }}>{error}</p>
                )}
              </div>
              <div className="flex gap-3 px-6 pb-6">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setDeleteOpen(false)} disabled={isPending}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={handleDelete} disabled={isPending}>
                  {isPending ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        </td>
      )}
    </>
  )
}
