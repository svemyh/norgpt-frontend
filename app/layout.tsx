import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NorGPT",
  description: "Norsk AI-assistent. Sikker, gratis, personvernbevarende.",
    generator: 'NorGPT'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
