"use client"

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'

export function useToast() {
  const [isVisible, setIsVisible] = useState(false)

  const showToast = useCallback(({ title, description, type = "default" }) => {
    setIsVisible(true)
    
    // Map our simplified API to react-hot-toast
    if (type === "success" || !type) {
      toast.success(description || title)
    } else if (type === "error") {
      toast.error(description || title)
    } else if (type === "loading") {
      toast.loading(description || title)
    } else {
      // Default case
      toast(description || title)
    }
    
    return () => setIsVisible(false)
  }, [])

  return {
    toast: showToast,
    isVisible
  }
}
