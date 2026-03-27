import { TrendingDown, Clock, DollarSign } from "lucide-react"

const serviceColors: Record<string, { bg: string; text: string; dot: string }> = {
  Ground: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  "2nd Day": { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  "Next Day": { bg: "bg-violet-500/10", text: "text-violet-400", dot: "bg-violet-400" },
}

function getServiceStyle(label: string) {
  if (label.includes("Ground")) return serviceColors["Ground"]
  if (label.includes("2nd Day")) return serviceColors["2nd Day"]
  if (label.includes("Next Day")) return serviceColors["Next Day"]
  return { bg: "bg-secondary/50", text: "text-muted-foreground", dot: "bg-muted-foreground" }
}

export function RateTable({ rates }: { rates: any[] }) {
  if (!rates || rates.length === 0) return null
  if (!Array.isArray(rates)) return null

  const sorted = [...rates].sort((a, b) => a.totalCharge - b.totalCharge)
  const cheapest = sorted[0]

  return (
    <div className="animate-slide-up">
      {/* Summary bar */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <TrendingDown className="w-4 h-4 text-emerald-400" />
        <span className="text-sm text-muted-foreground">
          <span className="text-foreground font-medium">{rates.length} quotes</span> found — best rate{" "}
          <span className="text-emerald-400 font-semibold mono">
            {cheapest.totalCharge} {cheapest.currency}
          </span>
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((rate, idx) => {
          const style = getServiceStyle(rate.serviceLabel)
          const isBest = idx === 0

          return (
            <div
              key={rate.id}
              className={`glass rounded-xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-row-hover transition-all duration-200 ${
                isBest ? "border border-emerald-500/25 shadow-[0_0_20px_hsla(152,76%,40%,0.07)]" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isBest ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                }`}>
                  {idx + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{rate.carrier}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {rate.serviceLabel}
                    </span>
                    {isBest && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Best Value
                      </span>
                    )}
                  </div>

                  {rate.estimatedDays && (
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {rate.estimatedDays} business {rate.estimatedDays === 1 ? "day" : "days"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:text-right pl-11 sm:pl-0">
                <DollarSign className="w-4 h-4 text-muted-foreground/50" />
                <span className="mono text-xl font-bold">
                  {rate.totalCharge}
                </span>
                <span className="text-xs text-muted-foreground">{rate.currency}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
