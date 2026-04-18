"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { RateForm } from "@/components/RateForm"
import { RateTable } from "@/components/RateTable"
import { HistoryTable } from "@/components/HistoryTable"
import { Toaster } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, History, Zap, ArrowRight } from "lucide-react"

export default function Home() {
  const [rates, setRates] = useState<any[]>([])
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-6 py-20 max-w-5xl">
          {/* Hero */}
          <div className="mb-12 animate-slide-up text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
              <Zap className="w-3 h-3" />
              Real-time carrier rates
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              Compare Shipping Rates
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Instantly compare rates across major carriers — UPS, FedEx, and more. Get the best rates for your shipments.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="glass rounded-2xl p-6">
              <Package className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Multi-Carrier</h3>
              <p className="text-sm text-muted-foreground">Compare rates from all major shipping carriers in one place.</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <Zap className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Real-time Quotes</h3>
              <p className="text-sm text-muted-foreground">Get instant quotes from carrier APIs — always current and accurate.</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <History className="w-8 h-8 text-blue-500 mb-4" />
              <h3 className="font-semibold mb-2">Rate History</h3>
              <p className="text-sm text-muted-foreground">Track all your shipping queries and find the best rates over time.</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
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

        {/* History Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Your Recent Quotes</h2>
          <HistoryTable />
        </div>
      </div>

      <Toaster />
    </main>
  )
}
