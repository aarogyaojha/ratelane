"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Package, ArrowRight, Clock, DollarSign, InboxIcon } from "lucide-react"

export function HistoryTable() {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data)
      })
      .catch(err => toast({ variant: "destructive", title: "Error loading history", description: err.message }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-secondary/80 rounded w-1/3 mb-3" />
            <div className="h-3 bg-secondary/60 rounded w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-secondary/60 flex items-center justify-center mb-5">
          <InboxIcon className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="font-semibold text-foreground mb-1">No history yet</p>
        <p className="text-sm text-muted-foreground">Your rate requests will appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {history.map((req) => {
        const bestQuote = req.quotes?.sort((a: any, b: any) => a.totalCharge - b.totalCharge)[0]
        return (
          <div key={req.id} className="glass glass-hover rounded-xl p-5">
            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className="mono">{req.originZip}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span className="mono">{req.destZip}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(req.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                      hour: "2-digit", minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>

              {bestQuote && (
                <div className="flex items-center gap-1 text-right flex-shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400/70" />
                  <span className="mono font-bold text-emerald-400">{bestQuote.totalCharge}</span>
                  <span className="text-xs text-muted-foreground">{bestQuote.currency}</span>
                </div>
              )}
            </div>

            {/* Details row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 pl-12">
              <span>{req.weightLbs} lbs</span>
              {req.lengthIn && <span>· {req.lengthIn}×{req.widthIn}×{req.heightIn} in</span>}
              <span>· {req.quotes?.length ?? 0} quotes</span>
            </div>

            {/* Quotes */}
            {req.quotes && req.quotes.length > 0 && (
              <div className="pl-12 flex flex-wrap gap-2">
                {req.quotes.sort((a: any, b: any) => a.totalCharge - b.totalCharge).map((q: any, idx: number) => (
                  <span
                    key={q.id}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                      idx === 0
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-secondary/50 text-muted-foreground border-border/60"
                    }`}
                  >
                    {q.serviceLabel}
                    <span className="mono font-semibold">{q.totalCharge}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
