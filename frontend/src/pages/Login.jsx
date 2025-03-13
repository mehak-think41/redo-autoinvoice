"use client"

import { useNavigate } from "react-router-dom"
import { login } from "../utils/auth"
import { CheckCircle, FileText, BarChart2, Zap, ArrowRight } from "lucide-react"

export default function Login() {
  const navigate = useNavigate()

  const handleGoogleLogin = () => {
    login({ email: "user@google.com" })
    navigate("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center text-center max-w-3xl mx-auto space-y-8 z-10 mt-16">
        

        <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl leading-tight">
          AI-Powered{" "}
          <span className="text-indigo-600 relative">
            Invoice Processing
            <svg
              className="absolute -bottom-2 left-0 w-full h-2 text-indigo-200"
              viewBox="0 0 200 8"
              preserveAspectRatio="none"
            >
              <path d="M0,5 C50,0 150,0 200,5" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
          </span>
        </h1>

        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Streamline your invoice processing with our AI-powered dashboard. Automate approvals, manage inventory, and
          analyze gaps effortlessly.
        </p>

        <button
          onClick={handleGoogleLogin}
          className="mt-6 flex items-center justify-center gap-3 px-8 py-4 text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
        >
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign in with Google
          <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        
      </div>

      {/* Features Section */}
      <div className="relative mt-24 w-full max-w-4xl z-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold">
          Features
        </div>
        <p className="text-center text-3xl font-bold text-gray-900 mt-4">Everything you need to manage invoices</p>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {[
            {
              icon: <FileText className="w-10 h-10 text-indigo-500" />,
              title: "Invoice Processing",
              desc: "Automated processing of invoices with AI-powered data extraction.",
            },
            {
              icon: <CheckCircle className="w-10 h-10 text-green-500" />,
              title: "Approval Workflow",
              desc: "Streamlined approval process with automated routing and notifications.",
            },
            {
              icon: <BarChart2 className="w-10 h-10 text-blue-500" />,
              title: "Gap Analysis",
              desc: "Identify and analyze gaps in your inventory and procurement process.",
            },
            {
              icon: <Zap className="w-10 h-10 text-yellow-500" />,
              title: "Automation Control",
              desc: "Control and monitor automated invoice processing with ease.",
            },
          ].map(({ icon, title, desc }, index) => (
            <div key={index} className="flex items-start gap-5 p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="p-3 bg-gray-100 rounded-lg">{icon}</div>
              <div>
                <p className="text-lg font-medium text-gray-900">{title}</p>
                <p className="text-gray-600 mt-1">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} InvoiceAI. All rights reserved.
      </div>
    </div>
  )
}

