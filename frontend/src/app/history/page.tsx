import { HistoryTable } from "@/components/HistoryTable"
import { Toaster } from "@/components/ui/use-toast"
import Link from "next/link"
import { Package, ArrowLeft, History } from "lucide-react"

export default function HistoryPage() {
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
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-1.5 rounded-lg hover:bg-secondary/60"
          >
            <ArrowLeft className="w-4 h-4" />
            New Request
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Hero */}
        <div className="mb-8 animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-400 text-xs font-medium mb-4">
            <History className="w-3 h-3" />
            Session history
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Request History</h1>
          <p className="text-muted-foreground text-lg">All shipment rate lookups from your current session.</p>
        </div>

        <HistoryTable />
      </div>

      <Toaster />
    </main>
  )
}
