// app/providers.tsx
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PackingListProvider } from "@/contexts/packing-list-context"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  // useState ensures each request gets its own QueryClient instance
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <PackingListProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </PackingListProvider>
    </QueryClientProvider>
  )
}
