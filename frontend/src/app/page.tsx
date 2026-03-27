"use client"

import { useState } from "react"
import { RateForm } from "@/components/RateForm"
import { RateTable } from "@/components/RateTable"
import { Toaster } from "@/components/ui/use-toast"
import Link from "next/link"
import { Package, History, Zap } from "lucide-react"

export default function Home() {
  const [rates, setRates] = useState<any[]>([])

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 glass sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">Cybership</span>
          </div>
          <Link
            href="/history"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-secondary/60"
          >
            <History className="w-4 h-4" />
            View History
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero */}
        <div className="mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
            <Zap className="w-3 h-3" />
            Real-time carrier rates
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Compare Shipping Rates
          </h1>
          <p className="text-muted-foreground text-lg">
            Instantly compare rates across major carriers — UPS, FedEx, and more.
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-6 md:p-8 glow-blue animate-fade-in mb-6">
          <p className="section-label mb-5">Shipment Details</p>
          <RateForm onRatesFetched={setRates} />
        </div>

        {/* Results */}
        <RateTable rates={rates} />
      </div>

      <Toaster />
    </main>
  )
}
