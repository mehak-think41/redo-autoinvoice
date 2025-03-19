"use client"

import { useState, useEffect } from "react"
import { FaGoogle } from "react-icons/fa"
import { FileText, CheckSquare, BarChart2, Play, ArrowRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import Lottie from "react-lottie-player"
import { useToast } from "../../hooks/use-toast"
import invoiceAnimationData from "../../assets/invoice-animation.json"
import dashboardAnimationData from "../../assets/dashboard-animation.json"
import Image from 'next/image';
import heroImage from '@/assets/2.jpg';
import howItWorksImage from '@/assets/Untitled design.png';
import { useAuth } from "@/context/AuthContext"
import { getGoogleAuthUrl } from "@/lib/api"

const LoginPage = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard")
    }

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [router, isAuthenticated, authLoading])

  const handleGoogleLogin = async () => {
    setLoading(true)
    
    try {
      // Get Google authentication URL from the backend
      const url = await getGoogleAuthUrl()
      
      // Redirect to Google authentication page
      window.location.href = url
    } catch (error) {
      console.error("Failed to get Google authentication URL:", error)
      toast({
        title: "Error",
        description: "Failed to initiate Google login. Please try again.",
        variant: "destructive"
      })
      setLoading(false)
    }
  }

  const features = [
    {
      icon: FileText,
      title: "Invoice Processing",
      description: "Automated processing of invoices with AI-powered data extraction.",
    },
    {
      icon: CheckSquare,
      title: "Approval Workflow",
      description: "Streamlined approval process with automated routing and notifications.",
    },
    {
      icon: BarChart2,
      title: "Gap Analysis",
      description: "Identify and analyze gaps in your inventory and procurement process.",
    },
    {
      icon: Play,
      title: "Automation Control",
      description: "Control and monitor automated invoice processing with ease.",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "CFO, TechCorp Inc.",
      content:
        "InvoiceAI has transformed our accounts payable process. We've reduced processing time by 75% and virtually eliminated data entry errors.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Michael Chen",
      role: "Finance Director, Global Retail",
      content:
        "The gap analysis feature alone has saved us thousands by optimizing our inventory levels. The ROI on this platform was immediate.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Jessica Williams",
      role: "AP Manager, Healthcare Solutions",
      content:
        "Our team loves the intuitive interface and the automated approval workflows. Training new staff is now a breeze.",
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"}`}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center text-white font-bold mr-2">
              IA
            </div>
            <span className="text-xl font-bold text-gray-900">InvoiceAI</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-black transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">
              How it works
            </a>
            <a href="#testimonials" className="text-gray-600 hover:text-black transition-colors">
              Testimonials
            </a>
            <button
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          <button className="md:hidden text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              AI-Powered Invoice Processing
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Streamline your invoice processing with our AI-powered dashboard. Automate approvals, manage inventory,
              and analyze gaps effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <FaGoogle className="h-5 w-5 mr-2 text-white" />
                <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
              </button>
              <a
                href="#features"
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="w-full max-w-md rounded-lg overflow-hidden">
              <Image src={heroImage} alt="AI Invoice Processing" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage invoices efficiently and intelligently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="bg-gray-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-gray-800" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies invoice processing from receipt to payment
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-4 shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Invoices</h3>
                    <p className="text-gray-600">
                      Upload invoices manually or set up automated email forwarding. Our system accepts PDF, image, and
                      digital formats.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-4 shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Processing</h3>
                    <p className="text-gray-600">
                      Our AI extracts key data points, categorizes the invoice, and matches it with purchase orders and
                      inventory.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-4 shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Approval Workflow</h3>
                    <p className="text-gray-600">
                      Invoices are routed through your customized approval workflow with automated notifications and
                      reminders.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-black rounded-full w-8 h-8 flex items-center justify-center text-white font-bold mr-4 shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment & Reporting</h3>
                    <p className="text-gray-600">
                      Approved invoices are flagged for payment and all data is available for comprehensive reporting
                      and analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md rounded-lg overflow-hidden">
                <Image src={howItWorksImage} alt="How It Works" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by finance teams across industries
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to streamline your invoice processing?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of businesses that have transformed their accounts payable workflow with InvoiceAI.
          </p>
          <button
            className="bg-white text-black px-8 py-3 rounded-md hover:bg-gray-200 transition-colors text-lg font-semibold"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Get Started Today"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center text-white font-bold mr-2">
                  IA
                </div>
                <span className="text-xl font-bold">InvoiceAI</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered invoice processing and accounts payable automation for modern businesses.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Guides
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} InvoiceAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LoginPage