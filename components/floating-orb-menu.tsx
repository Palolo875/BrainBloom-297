import { useState, useCallback, useMemo } from "react"
import { SoftUICard } from "@/components/soft-ui-card"
import { BookOpen, Network, Settings, Sparkles, Plus, Compass, Calendar, Brain } from "lucide-react"

// Floating Orb Menu Component
export function FloatingOrbMenu({
  currentView,
  onViewChange,
}: {
  currentView: string
  onViewChange: (
    view: "home" | "notes" | "editor" | "graph" | "modules" | "settings" | "tasks" | "journal" | "learning",
  ) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback(() => {
    setIsExpanded(!isExpanded)
  }, [isExpanded])

  const handlePress = useCallback(() => {
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150) // Reduced from 300ms to 150ms
  }, [])

  const menuItems = useMemo(() => {
    const allItems = [
      { icon: BookOpen, label: "Notes", view: "notes" as const, color: "text-accent-peach" },
      { icon: Compass, label: "Tasks", view: "tasks" as const, color: "text-accent-sage" },
      { icon: Calendar, label: "Journal", view: "journal" as const, color: "text-accent-lavender" },
      { icon: Brain, label: "Learning", view: "learning" as const, color: "text-accent-honey" },
      { icon: Network, label: "Graph", view: "graph" as const, color: "text-accent-lavender" },
      { icon: Sparkles, label: "Modules", view: "modules" as const, color: "text-accent-honey" },
      { icon: Settings, label: "Settings", view: "settings" as const, color: "text-accent-green" },
    ]

    return allItems.filter((item) => item.view !== currentView)
  }, [currentView])

  const handleMenuItemClick = useCallback(
    (view: (typeof menuItems)[0]["view"]) => {
      onViewChange(view)
      setIsExpanded(false)
    },
    [onViewChange, menuItems],
  )

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Menu Items */}
      {isExpanded && (
        <div className="absolute bottom-16 sm:bottom-20 right-0 space-y-2 sm:space-y-3">
          {menuItems.map((item, index) => (
            <div
              key={item.view}
              className="animate-in slide-in-from-bottom-1 fade-in duration-200"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <SoftUICard
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-150 active:scale-95"
                onClick={() => handleMenuItemClick(item.view)}
              >
                <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
              </SoftUICard>
            </div>
          ))}
        </div>
      )}

      {/* Main Orb */}
      <SoftUICard
        pressed={isPressed}
        className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer relative hover:scale-105 active:scale-95 transition-all duration-150"
        onClick={() => {
          handlePress()
          handleClick()
        }}
      >
        <div className="relative">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 bg-accent-green rounded-full flex items-center justify-center transition-all duration-150 ${isExpanded ? "rotate-45" : "rotate-0"}`}
          >
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full" />
          </div>
          {!isExpanded && (
            <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent-peach rounded-full animate-pulse" />
          )}
        </div>
      </SoftUICard>
    </div>
  )
}


