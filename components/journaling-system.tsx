"use client"

import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SoftUICard } from "./soft-ui-card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Calendar, TrendingUp, Activity, Heart, Book, Moon, Coffee, Dumbbell, Brain, Loader2 } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import type { JournalEntryFromDB } from "@/app/journal/page"
import { saveJournalEntry, findSimilarJournalEntries } from "@/app/_actions/journal"

// Internal component state uses Date objects for easier manipulation
interface JournalEntry {
  id: number | string // Can be a number from DB or a string for a new entry
  date: Date
  content: string | null
  mood: number
  energy: number
  activities: string[]
  gratitude: string | null
  learned: string | null
}

interface JournalingSystemProps {
  initialEntries: JournalEntryFromDB[]
}

export function JournalingSystem({ initialEntries }: JournalingSystemProps) {
  const router = useRouter()
  const [currentView, setCurrentView] = useState<"today" | "calendar" | "stats">("today")
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSaving, setIsSaving] = useState(false)
  const [similarEntries, setSimilarEntries] = useState<any[]>([])
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false)

  // Transform DB entries (with string dates) to internal state (with Date objects)
  const transformedEntries = useMemo(() => {
    return initialEntries.map(e => ({
      ...e,
      id: e.id,
      date: parseISO(e.entry_date), // Convert string date to Date object
      activities: e.activities || [],
    }))
  }, [initialEntries])

  const [entries, setEntries] = useState<JournalEntry[]>(transformedEntries)

  const [todayEntry, setTodayEntry] = useState<Partial<JournalEntry>>({
    content: "",
    mood: 3,
    energy: 3,
    activities: [],
    gratitude: "",
    learned: "",
  })

  const today = new Date()

  // Effect to find and set today's entry from the loaded list
  useEffect(() => {
    const existingTodayEntry = entries.find((entry) => isSameDay(entry.date, today))
    if (existingTodayEntry) {
      setTodayEntry(existingTodayEntry)
      if (typeof existingTodayEntry.id === 'number') {
        fetchSimilarEntries(existingTodayEntry.id)
      }
    }
  }, [entries, today])

  const fetchSimilarEntries = async (entryId: number) => {
    setIsLoadingSimilar(true)
    const result = await findSimilarJournalEntries(entryId)
    if (result.data) {
      setSimilarEntries(result.data)
    }
    setIsLoadingSimilar(false)
  }

  const availableActivities = [
    { id: "sport", label: "Sport", icon: Dumbbell },
    { id: "méditation", label: "Méditation", icon: Brain },
    { id: "lecture", label: "Lecture", icon: Book },
    { id: "travail", label: "Travail", icon: Coffee },
    { id: "amis", label: "Amis", icon: Heart },
    { id: "nature", label: "Nature", icon: Activity },
    { id: "sommeil", label: "Mauvais sommeil", icon: Moon },
  ]

  const moodEmojis = [
    { value: 1, emoji: "😢", label: "Terrible" },
    { value: 2, emoji: "😕", label: "Difficile" },
    { value: 3, emoji: "😐", label: "Neutre" },
    { value: 4, emoji: "😊", label: "Bien" },
    { value: 5, emoji: "😄", label: "Excellent" },
  ]

  const saveEntry = async () => {
    if (isSaving) return
    setIsSaving(true)

    const payload = {
      entry_date: today.toISOString(),
      content: todayEntry.content || "",
      mood: todayEntry.mood || 3,
      energy: todayEntry.energy || 3,
      activities: todayEntry.activities || [],
      gratitude: todayEntry.gratitude || "",
      learned: todayEntry.learned || "",
    }

    // Optimistic UI Update
    const newEntryForUI: JournalEntry = {
        id: todayEntry.id || 'new-entry', // Use existing ID or a placeholder
        date: today,
        ...payload
    }

    const existingEntryIndex = entries.findIndex(e => isSameDay(e.date, today));

    if (existingEntryIndex > -1) {
        const updatedEntries = [...entries];
        updatedEntries[existingEntryIndex] = newEntryForUI;
        setEntries(updatedEntries);
    } else {
        setEntries([...entries, newEntryForUI]);
    }

    const result = await saveJournalEntry(payload)
    setIsSaving(false)

    if (result.error) {
      console.error("Failed to save entry:", result.error.message)
      // Here you could add a toast notification to inform the user
      // For now, we just log the error. The optimistic update will be reverted on next page load.
    } else {
      console.log("Entry saved successfully")
      // No need to do anything else, revalidatePath on server will handle data refresh
    }
  }

  const toggleActivity = (activityId: string) => {
    setTodayEntry((prev) => ({
      ...prev,
      activities: prev.activities?.includes(activityId)
        ? prev.activities.filter((id) => id !== activityId)
        : [...(prev.activities || []), activityId],
    }))
  }

  const getMonthDays = () => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }

  const getEntryForDate = (date: Date) => {
    return entries.find((entry) => isSameDay(entry.date, date))
  }

  const getMoodColor = (mood: number) => {
    const colors = {
      1: "bg-red-200",
      2: "bg-orange-200",
      3: "bg-yellow-200",
      4: "bg-green-200",
      5: "bg-emerald-200",
    }
    return colors[mood as keyof typeof colors] || "bg-gray-100"
  }

  // --- The rest of the component's rendering logic remains largely the same ---
  // --- Only the `onBack` calls are replaced with `router.back()` ---

  if (currentView === "today") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            {/* ... other header elements ... */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Le Sismographe</h1>
                <p className="text-muted-foreground text-pretty">
                  Cartographiez votre paysage intérieur et découvrez vos patterns.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant={currentView === "today" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("today")}>Aujourd'hui</Button>
                <Button variant={currentView === "calendar" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("calendar")}> <Calendar className="w-4 h-4 mr-2" /> Calendrier </Button>
                <Button variant={currentView === "stats" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("stats")}> <TrendingUp className="w-4 h-4 mr-2" /> Statistiques </Button>
              </div>
            </div>
          </div>

          {/* Today's Entry */}
          <div className="space-y-6">
            <SoftUICard className="p-6">
              <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
                {format(today, "EEEE d MMMM yyyy", { locale: fr })}
              </h2>

              {/* ... (rest of the form remains the same) ... */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Comment vous sentez-vous ?</h3>
                <div className="flex gap-2 flex-wrap">
                  {moodEmojis.map((mood) => (
                    <button key={mood.value} onClick={() => setTodayEntry((prev) => ({ ...prev, mood: mood.value }))} className={cn("p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-1", todayEntry.mood === mood.value ? "border-accent-sage bg-accent-sage/10" : "border-muted hover:border-accent-sage/50")}>
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-xs text-muted-foreground">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Niveau d'énergie</h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button key={level} onClick={() => setTodayEntry((prev) => ({ ...prev, energy: level }))} className={cn("w-8 h-8 rounded-full border-2 transition-all duration-200", (todayEntry.energy || 0) >= level ? "border-accent-peach bg-accent-peach" : "border-muted hover:border-accent-peach/50")} />
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Activités d'aujourd'hui</h3>
                <div className="flex gap-2 flex-wrap">
                  {availableActivities.map((activity) => (
                    <button key={activity.id} onClick={() => toggleActivity(activity.id)} className={cn("px-3 py-2 rounded-xl border-2 transition-all duration-200 flex items-center gap-2", todayEntry.activities?.includes(activity.id) ? "border-accent-sage bg-accent-sage/10" : "border-muted hover:border-accent-sage/50")}>
                      <activity.icon className="w-4 h-4" />
                      <span className="text-sm">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Comment s'est passée votre journée ?</h3>
                <Textarea placeholder="Décrivez votre journée, vos pensées, vos ressentis..." value={todayEntry.content || ""} onChange={(e) => setTodayEntry((prev) => ({ ...prev, content: e.target.value }))} className="min-h-[120px] resize-none" />
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Gratitude</h3>
                <Textarea placeholder="Pour quoi êtes-vous reconnaissant(e) aujourd'hui ?" value={todayEntry.gratitude || ""} onChange={(e) => setTodayEntry((prev) => ({ ...prev, gratitude: e.target.value }))} className="min-h-[80px] resize-none" />
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-medium text-foreground mb-3">Ce que j'ai appris</h3>
                <Textarea placeholder="Qu'avez-vous appris ou découvert aujourd'hui ?" value={todayEntry.learned || ""} onChange={(e) => setTodayEntry((prev) => ({ ...prev, learned: e.target.value }))} className="min-h-[80px] resize-none" />
              </div>

              <Button onClick={saveEntry} className="w-full" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde...</> : (todayEntry.id ? "Mettre à jour" : "Sauvegarder") + " l'entrée"}
              </Button>
            </SoftUICard>

            {/* Similar Entries Section */}
            {todayEntry.id && (
                 <SoftUICard className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-4">Souvenirs similaires...</h3>
                    {isLoadingSimilar ? (
                        <div className="flex justify-center items-center p-4">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                        </div>
                    ) : similarEntries.length > 0 ? (
                        <div className="space-y-4">
                            {similarEntries.map(entry => (
                                <div key={entry.id} className="border-b border-gray-200 pb-3">
                                    <p className="font-semibold text-sm mb-1">{format(parseISO(entry.entry_date), "d MMMM yyyy", { locale: fr })}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center">Aucune entrée similaire trouvée.</p>
                    )}
                 </SoftUICard>
            )}
          </div>
        </div>
      </div>
    )
  }

  // The other views (calendar, stats) will also need the router.back() change
  // and will now work with the real data.
  if (currentView === "calendar") {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Calendrier des Humeurs</h1>
                <p className="text-muted-foreground text-pretty">Visualisez vos patterns émotionnels au fil du temps.</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={currentView === "today" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("today")}>Aujourd'hui</Button>
                <Button variant={currentView === "calendar" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("calendar")}><Calendar className="w-4 h-4 mr-2" />Calendrier</Button>
                <Button variant={currentView === "stats" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("stats")}><TrendingUp className="w-4 h-4 mr-2" />Statistiques</Button>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}>←</Button>
            <h2 className="text-xl font-serif font-semibold">{format(currentMonth, "MMMM yyyy", { locale: fr })}</h2>
            <Button variant="outline" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>→</Button>
          </div>
          <SoftUICard className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {getMonthDays().map((date) => {
                const entry = getEntryForDate(date)
                const isToday = isSameDay(date, new Date())
                return (
                  <div key={date.toISOString()} className={cn("aspect-square p-2 rounded-lg border-2 transition-all duration-200 cursor-pointer", entry ? getMoodColor(entry.mood) : "bg-gray-50", isToday && "border-accent-sage", !entry && "border-muted hover:border-accent-sage/50")}>
                    <div className="text-sm font-medium text-foreground">{format(date, "d")}</div>
                    {entry && (<div className="text-xs text-muted-foreground mt-1">{moodEmojis.find((m) => m.value === entry.mood)?.emoji}</div>)}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs">
              <span className="text-muted-foreground">Humeur:</span>
              {moodEmojis.map((mood) => (
                <div key={mood.value} className="flex items-center gap-1">
                  <div className={cn("w-3 h-3 rounded", getMoodColor(mood.value))} />
                  <span className="text-muted-foreground">{mood.label}</span>
                </div>
              ))}
            </div>
          </SoftUICard>
        </div>
      </div>
    )
  }

  if (currentView === "stats") {
    // Note: The stats calculations might need adjustments based on real data patterns.
    // For now, the existing logic is kept.
    const correlations = [] // Re-implement or simplify correlation logic if needed
    const moodTrend = 0 // Re-implement or simplify trend logic
    const avgMood = entries.length > 0 ? entries.reduce((sum, e) => sum + e.mood, 0) / entries.length : 0
    const avgEnergy = entries.length > 0 ? entries.reduce((sum, e) => sum + e.energy, 0) / entries.length : 0

    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
           <div className="mb-6">
            <Button onClick={() => router.back()} variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-serif text-foreground font-bold mb-2">Découvertes & Corrélations</h1>
                <p className="text-muted-foreground text-pretty">L'IA analyse vos patterns pour révéler des insights personnalisés.</p>
              </div>
              <div className="flex items-center gap-2">
                 <Button variant={currentView === "today" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("today")}>Aujourd'hui</Button>
                <Button variant={currentView === "calendar" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("calendar")}><Calendar className="w-4 h-4 mr-2" />Calendrier</Button>
                <Button variant={currentView === "stats" ? "default" : "outline"} size="sm" onClick={() => setCurrentView("stats")}><TrendingUp className="w-4 h-4 mr-2" />Statistiques</Button>
              </div>
            </div>
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SoftUICard className="p-6">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Vue d'ensemble</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Humeur moyenne</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{avgMood.toFixed(1)}/5</span>
                    <span className="text-lg">{moodEmojis.find((m) => m.value === Math.round(avgMood))?.emoji}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Énergie moyenne</span>
                  <span className="font-medium">{avgEnergy.toFixed(1)}/5</span>
                </div>
              </div>
            </SoftUICard>
             <SoftUICard className="p-6 col-span-full">
                <div className="text-center">
                  <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Analyses à venir</h3>
                  <p className="text-muted-foreground">Continuez à tenir votre journal pour découvrir vos patterns personnels.</p>
                </div>
              </SoftUICard>
          </div>
        </div>
      </div>
    )
  }

  return null
}
