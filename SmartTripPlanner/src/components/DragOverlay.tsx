import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

interface DragOverlayProps {
  isDragging: boolean
}

export default function DragOverlay({ isDragging }: DragOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isDragging) return null

  // Create a portal for the overlay
  return createPortal(
    <div className="fixed inset-0 bg-primary/5 pointer-events-none z-50 flex items-center justify-center">
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-background/90 shadow-lg rounded-full px-4 py-2 border border-primary/20">
        <p className="text-sm font-medium flex items-center gap-2">
          <span className="animate-pulse inline-block h-2 w-2 rounded-full bg-primary"></span>
          Drop to add to your itinerary
        </p>
      </div>
    </div>,
    document.body
  )
}
