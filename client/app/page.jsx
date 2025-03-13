"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuth") === "true"
    if (isAuth) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return null
}

