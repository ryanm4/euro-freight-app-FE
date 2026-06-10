import { Geist_Mono, Manrope } from "next/font/google"

import { AppSidebar } from "@/components/app-sidebar"
import { ReusableBreadcrumb } from "@/components/reusable-breadcrumb"
import { ThemeProvider } from "@/components/theme-provider"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import "./globals.css"

const manrope = Manrope({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        manrope.variable
      )}
    >
      <body>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <ThemeProvider defaultTheme="dark">
              <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-16" />
                <ReusableBreadcrumb />
              </header>
              <main className="relative flex w-full flex-1 flex-col">
                {children}
              </main>
            </ThemeProvider>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  )
}
