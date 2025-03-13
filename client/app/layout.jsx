import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "react-hot-toast"

// Remove Google Font import and use system fonts instead
// const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "InvoiceAI - AI-powered Invoice Processing",
  description: "Modern invoice processing dashboard powered by AI",
  generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans h-full w-full m-0 p-0">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Toaster position="top-right" />
          <div className="h-full w-full">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  )
}