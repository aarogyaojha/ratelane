"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { MapPin, Weight, Ruler, ChevronRight, Loader2 } from "lucide-react"

const formSchema = z.object({
  originZip: z.string().min(5),
  destZip: z.string().min(5),
  weightLbs: z.coerce.number().min(0.1),
  lengthIn: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  widthIn: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  heightIn: z.coerce.number().optional().or(z.literal("").transform(() => undefined)),
  serviceCode: z.string().optional(),
})

export function RateForm({ onRatesFetched }: { onRatesFetched: (rates: any[]) => void }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      originZip: "", destZip: "", weightLbs: 1, serviceCode: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      const payload = { ...values }
      if (!payload.serviceCode) delete payload.serviceCode

      const res = await fetch('/api/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch rates')

      onRatesFetched(data)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">

        {/* ZIP Codes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="section-label">Route</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="originZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">Origin ZIP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="90210"
                      {...field}
                      className="bg-secondary/50 border-border/60 focus:border-blue-500/60 focus:bg-secondary/80 transition-all duration-200 mono placeholder:text-muted-foreground/40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="destZip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">Destination ZIP</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="10001"
                      {...field}
                      className="bg-secondary/50 border-border/60 focus:border-blue-500/60 focus:bg-secondary/80 transition-all duration-200 mono placeholder:text-muted-foreground/40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Weight & Dimensions */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Weight className="w-4 h-4 text-violet-400" />
            <span className="section-label">Weight & Dimensions</span>
            <span className="text-xs text-muted-foreground/60 ml-1">(optional)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <FormField
              control={form.control}
              name="weightLbs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">Weight <span className="text-muted-foreground/50">lbs</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      {...field}
                      className="bg-secondary/50 border-border/60 focus:border-violet-500/60 focus:bg-secondary/80 transition-all duration-200 mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lengthIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">Length <span className="text-muted-foreground/50">in</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      className="bg-secondary/50 border-border/60 focus:border-violet-500/60 focus:bg-secondary/80 transition-all duration-200 mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="widthIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">Width <span className="text-muted-foreground/50">in</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      className="bg-secondary/50 border-border/60 focus:border-violet-500/60 focus:bg-secondary/80 transition-all duration-200 mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heightIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground text-xs font-medium">Height <span className="text-muted-foreground/50">in</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      className="bg-secondary/50 border-border/60 focus:border-violet-500/60 focus:bg-secondary/80 transition-all duration-200 mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Service */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <span className="section-label">Service Level</span>
          </div>
          <FormField
            control={form.control}
            name="serviceCode"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-secondary/50 border-border/60 focus:border-emerald-500/60 transition-all duration-200">
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="">All Services</SelectItem>
                    <SelectItem value="03">UPS Ground</SelectItem>
                    <SelectItem value="02">UPS 2nd Day Air</SelectItem>
                    <SelectItem value="01">UPS Next Day Air</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 border-0 font-semibold tracking-wide transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-[1.01] active:scale-[0.99]"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Fetching Rates...</>
            : <><span>Get Rates</span><ChevronRight className="w-4 h-4 ml-2" /></>
          }
        </Button>
      </form>
    </Form>
  )
}
