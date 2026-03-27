import * as React from "react"

export function useToast() {
  const toast = React.useCallback((props: { title?: React.ReactNode; description?: React.ReactNode; variant?: 'default' | 'destructive' }) => {
    // Current minimalist implementation
    if (typeof window !== "undefined") {
      alert(`${props.title}: ${props.description}`)
    }
  }, [])

  return React.useMemo(() => ({ toast }), [toast])
}

export const Toaster = () => null
