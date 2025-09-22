import type React from "react"
import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import { Lora } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import AuthButton from "@/components/auth-button"

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
})

export const metadata: Metadata = {
  title: "BrainBloom - Your Digital Garden of Ideas",
  description: "A beautiful note-taking app with organic design and fluid interactions",
  generator: "v0.app",
}

export default function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  return (
    <html lang={locale}>
      <body className={`font-sans ${lexend.variable} ${lora.variable} ${GeistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <header className="w-full flex justify-end p-4">
              <AuthButton />
            </header>
            <main className="flex-1 flex flex-col">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
