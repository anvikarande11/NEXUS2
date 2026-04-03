import { create } from 'zustand'

export type ViewType = 
  | 'dashboard' 
  | 'tasks' 
  | 'resources' 
  | 'knowledge-graph' 
  | 'calendar' 
  | 'subject-health' 
  | 'settings' 
  | 'games'

interface CalendarNote {
  id: string
  date: string
  content: string
  type: 'sticky' | 'photo'
  photoUrl?: string
}

interface DashboardState {
  // View navigation
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  
  // Focus mode
  isDeepFocusMode: boolean
  toggleDeepFocusMode: () => void
  
  // UI state
  isSidebarCollapsed: boolean
  isCommandPaletteOpen: boolean
  isResourceDrawerOpen: boolean
  selectedResourceId: string | null
  
  // Calendar notes
  calendarNotes: CalendarNote[]
  addCalendarNote: (note: Omit<CalendarNote, 'id'>) => void
  removeCalendarNote: (id: string) => void
  
  // Actions
  toggleSidebar: () => void
  toggleCommandPalette: () => void
  openResourceDrawer: (id: string) => void
  closeResourceDrawer: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  // View navigation
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  
  // Focus mode
  isDeepFocusMode: false,
  toggleDeepFocusMode: () => set((state) => ({ isDeepFocusMode: !state.isDeepFocusMode })),
  
  // UI state
  isSidebarCollapsed: true, // Start collapsed for cockpit feel
  isCommandPaletteOpen: false,
  isResourceDrawerOpen: false,
  selectedResourceId: null,
  
  // Calendar notes
  calendarNotes: [],
  addCalendarNote: (note) => set((state) => ({
    calendarNotes: [...state.calendarNotes, { ...note, id: crypto.randomUUID() }]
  })),
  removeCalendarNote: (id) => set((state) => ({
    calendarNotes: state.calendarNotes.filter(n => n.id !== id)
  })),
  
  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  openResourceDrawer: (id) => set({ isResourceDrawerOpen: true, selectedResourceId: id }),
  closeResourceDrawer: () => set({ isResourceDrawerOpen: false, selectedResourceId: null }),
}))
