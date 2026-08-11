"use client"
import dynamic from "next/dynamic"

const MapDisplay = dynamic(() => import("./MapDisplay"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-[var(--color-muted-foreground)] text-sm">Loading map...</div>
})

export default function MapWrapper({ latitude, longitude }: { latitude: number; longitude: number }) {
  return <MapDisplay latitude={latitude} longitude={longitude} />
}
