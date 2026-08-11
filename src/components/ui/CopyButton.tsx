"use client"

import { useState } from "react"
import { Copy01, Check } from "@untitledui/icons"
import { ButtonUtility } from "@/components/base/buttons/button-utility"

interface CopyButtonProps {
  value: string
  tooltip?: string
}

export function CopyButton({ value, tooltip = "Copy name" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea")
      el.value = value
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <ButtonUtility
      size="sm"
      color={copied ? "primary" : "secondary"}
      tooltip={copied ? "Copied!" : tooltip}
      icon={copied ? Check : Copy01}
      onClick={handleCopy}
    />
  )
}
