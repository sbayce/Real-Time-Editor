import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { NextUIProvider } from "@nextui-org/react"
import Header from "./components/header/Header"
import ReactQueryProvider from "@/utils/providers/ReactQueryProvider"
import { Roboto, Lexend, Mirza } from "next/font/google"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})
const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-roboto",
})
const lexend = Lexend({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lexend",
})
const mirza = Mirza({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mirza",
})

export const metadata: Metadata = {
  title: "Real Time Editor",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${roboto.variable} ${lexend.variable} ${mirza.variable}`}>
        <ReactQueryProvider>
          <NextUIProvider>
              <Toaster position="bottom-right" />
              <div className="flex flex-col min-h-screen light text-foreground bg-background">
                <Header />
                <div className="flex-1 sm:flex sm:justify-center">{children}</div>
              </div>
          </NextUIProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}
