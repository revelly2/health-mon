"use client"

import { useState, useTransition } from "react"
import { Edit01, Trash01 } from "@untitledui/icons"
import { X, AlertTriangle, Save } from "lucide-react"
import { ButtonUtility } from "@/components/base/buttons/button-utility"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import { Select } from "@/components/ui/Select"
import { deleteMaternalRecord, updateMaternalRecord } from "./actions"
import { CopyButton } from "@/components/ui/CopyButton"

type MaternalRecord = {
  id: string
  trimester: number | null
  fetal_heart_rate: number | null
  fundal_height: number | null
  notes: string | null
  residents?: { first_name: string | null; last_name: string | null } | null
}

export function RowActions({ record }: { record: MaternalRecord }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const patientName = `${record.residents?.last_name ?? ""}, ${record.residents?.first_name ?? ""}`

  function handleEdit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await updateMaternalRecord(record.id, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setEditOpen(false)
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteMaternalRecord(record.id)
      if (result?.error) {
        setError(result.error)
      } else {
        setDeleteOpen(false)
      }
    })
  }

  return (
    <>
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          <CopyButton value={patientName} tooltip="Copy patient name" />
          <ButtonUtility
            size="sm"
            color="secondary"
            tooltip="Edit record"
            icon={Edit01}
            onClick={() => { setEditOpen(true); setError(null) }}
          />
          <ButtonUtility
            size="sm"
            color="danger"
            tooltip="Delete record"
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
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div>
                  <h2 className="font-semibold text-base" style={{ color: "var(--color-foreground)" }}>Edit Maternal Care Record</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>{patientName}</p>
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
                <div className="px-6 py-5 space-y-4">
                  {error && (
                    <div className="rounded-lg px-4 py-3 text-sm font-medium" style={{ background: "var(--color-danger-light)", color: "var(--color-danger)" }}>
                      {error}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-trimester">Trimester <span style={{ color: "var(--color-danger)" }}>*</span></Label>
                    <Select id="edit-trimester" name="trimester" required defaultValue={record.trimester?.toString() ?? "1"}>
                      <option value="1">1st Trimester</option>
                      <option value="2">2nd Trimester</option>
                      <option value="3">3rd Trimester</option>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-fhr">Fetal Heart Rate (bpm)</Label>
                      <Input id="edit-fhr" name="fetal_heart_rate" type="number" defaultValue={record.fetal_heart_rate ?? ""} placeholder="e.g. 140" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-fh">Fundal Height (cm)</Label>
                      <Input id="edit-fh" name="fundal_height" type="number" step="0.5" defaultValue={record.fundal_height ?? ""} placeholder="e.g. 28" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-notes">Notes</Label>
                    <Textarea id="edit-notes" name="notes" defaultValue={record.notes ?? ""} placeholder="Observations, concerns..." className="min-h-[80px]" />
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
                <h3 className="font-semibold text-base mb-1" style={{ color: "var(--color-foreground)" }}>Delete Maternal Care Record?</h3>
                <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
                  This will permanently delete the Trimester {record.trimester} record for <strong>{patientName}</strong>. This action cannot be undone.
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
