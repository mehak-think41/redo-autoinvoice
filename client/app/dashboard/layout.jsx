"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { FileText, CheckSquare, Mail, Package, BarChart2, Play, User, LogOut, Home } from "lucide-react"

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const isAuth = localStorage.getItem("isAuth") === "true"
    const userData = localStorage.getItem("user")

    if (!isAuth) {
      router.push("/login")
    } else if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuth")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (!mounted || !user) {
    return null
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
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-sm">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
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
