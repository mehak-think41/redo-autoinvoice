"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText, CheckSquare, Mail, Package, BarChart2, Play, User, LogOut, Home } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Debug authentication state
  useEffect(() => {
    console.log("Dashboard Layout - Auth State:", { isAuthenticated, loading, user })
  }, [isAuthenticated, loading, user])

  useEffect(() => {
    setMounted(true)
    
    // If authentication check is complete and user is not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      console.log("Not authenticated, redirecting to login")
      router.push("/login")
    }
  }, [router, isAuthenticated, loading])

  // Handle logout using the auth context
  const handleLogout = async () => {
    await logout()
  }

  // Don't render anything until client-side hydration is complete
  // or while authentication is being checked
  if (!mounted || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // If not authenticated after loading, don't render the dashboard
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to access this page.</p>
          <Button onClick={() => router.push("/login")}>Go to Login</Button>
        </div>
      </div>
    )
  }

  // Ensure user data is available
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading User Data</h2>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Processed Invoices", href: "/dashboard/processed", icon: CheckSquare },
    { name: "Pending Approvals", href: "/dashboard/pending", icon: FileText },
    { name: "Return Emails", href: "/dashboard/emails", icon: Mail },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
    { name: "GAP Analysis", href: "/dashboard/gap", icon: BarChart2 },
    { name: "Automation", href: "/dashboard/automation", icon: Play },
  ]

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <div className="w-64 h-full bg-white border-r hidden md:block">
        <div className="h-16 border-b flex items-center px-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              IA
            </div>
            <span className="text-xl font-bold">InvoiceAI</span>
          </div>
        </div>
        <div className="py-4">
          <nav className="space-y-1 px-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${
                  pathname === item.href
                    ? "text-gray-500"
                    : "text-gray-400"
                }`} />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 border-t p-4">
          <Button variant="ghost" className="w-full flex items-center justify-start gap-2" onClick={handleLogout}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>{user.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-sm">
              <span className="font-medium">{user.name || 'User'}</span>
              <span className="text-xs text-muted-foreground">{user.email || 'user@example.com'}</span>
            </div>
          </Button>
        </div>
      </div>
      
      {/* Mobile sidebar */}
      <div className="md:hidden">
        {/* Add mobile menu button here */}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {navigation.find((item) => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
