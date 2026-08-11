"use client";

import { useState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HeartPulse, AlertCircle } from "lucide-react";
import GradientWaves from "@/components/ui/GradientWaves";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Gradient waves background */}
      <div className="absolute inset-0 z-0">
        <GradientWaves
          horizonColor="#e0f2fe"
          waveColor="#0ea5e9"
          crestColor="#10b981"
          speed={0.35}
          amplitude={2.2}
          waveScale={0.55}
          waveRatio={0.88}
          swell={30}
          turbulence={18}
          tilt={1.11}
          zoom={1.0}
          height={5.5}
          fogDepth={14}
          detail="medium"
          brightness={1.05}
          opacity={0.85}
          mouseInteraction={true}
          parallaxStrength={0.4}
          grain={true}
          grainIntensity={0.04}
        />
      </div>

      {/* Glass card */}
      <div
        className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out"
        style={{
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 20px 60px rgba(14,165,233,0.15), 0 4px 16px rgba(0,0,0,0.08)",
          padding: "2.5rem",
        }}
      >
        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl mb-4"
            style={{
              background: "var(--color-sidebar-bg)",
              boxShadow: "0 4px 16px rgba(14,165,233,0.3)",
            }}
          >
            <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.5} />
          </div>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            BARANGAY HEALTH STATUS MONITORING SYSTEM
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            Sign in to manage patient records
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="flex items-start gap-2.5 rounded-lg border p-3 text-sm"
              style={{
                background: "var(--color-danger-light)",
                borderColor: "rgba(239,68,68,0.2)",
                color: "var(--color-danger-dark)",
              }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold"
              style={{ color: "var(--color-foreground)" }}
            >
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-xs font-semibold"
                style={{ color: "var(--color-foreground)" }}
              >
                Password
              </label>
              <a
                href="#"
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--color-primary)" }}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
            />
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              className="w-full font-semibold"
              style={{ height: "40px" }}
              disabled={isLoading}
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <p
          className="mt-6 text-center text-[11px]"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Barangay Health Monitoring System · v1.0
        </p>
      </div>
    </div>
  );
}
