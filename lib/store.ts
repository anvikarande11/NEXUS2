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
  | 'class-path'

export type ResourceFilterType = 'all' | 'notes' | 'links' | 'videos' | 'pdf'
export type HealthStatus = 'red' | 'yellow' | 'green'

interface CalendarNote {
  id: string
  date: string
  content: string
  type: 'sticky' | 'photo'
  photoUrl?: string
}

export interface Node {
  id: string
  label: string
  completed: boolean
  resourceIds: string[]
  x: number
  y: number
  order: number
}

export interface ClassPath {
  id: string
  subjectId: string
  nodes: Node[]
}

interface WorkflowHealth {
  subjectId: string
  percentage: number
  status: HealthStatus
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
  
  // Class Path state
  classPaths: ClassPath[]
  activeClassId: string | null
  selectedNodeId: string | null
  resourceFilter: ResourceFilterType
  isNodeCreationOpen: boolean
  isLectureModalOpen: boolean
  lectureModalNodeId: string | null
  workflowHealth: WorkflowHealth[]
  
  // Class Path actions
  addNode: (classPathId: string, label: string) => void
  updateNode: (classPathId: string, nodeId: string, updates: Partial<Node>) => void
  deleteNode: (classPathId: string, nodeId: string) => void
  setActiveClass: (classPathId: string) => void
  setSelectedNode: (nodeId: string | null) => void
  setResourceFilter: (filter: ResourceFilterType) => void
  toggleNodeCreation: () => void
  openLectureModal: (nodeId: string) => void
  closeLectureModal: () => void
  calculateWorkflowHealth: (subjectId: string) => HealthStatus
  
  // Actions
  toggleSidebar: () => void
  toggleCommandPalette: () => void
  openResourceDrawer: (id: string) => void
  closeResourceDrawer: () => void
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
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
  
  // Class Path state - initialized empty, populated by mock data
  classPaths: [],
  activeClassId: null,
  selectedNodeId: null,
  resourceFilter: 'all',
  isNodeCreationOpen: false,
  isLectureModalOpen: false,
  lectureModalNodeId: null,
  workflowHealth: [],
  
  // Class Path actions
  addNode: (classPathId, label) => set((state) => ({
    classPaths: state.classPaths.map(cp => {
      if (cp.id === classPathId) {
        const newNode: Node = {
          id: crypto.randomUUID(),
          label,
          completed: false,
          resourceIds: [],
          x: 0,
          y: 0,
          order: cp.nodes.length
        }
        return { ...cp, nodes: [...cp.nodes, newNode] }
      }
      return cp
    })
  })),
  
  updateNode: (classPathId, nodeId, updates) => set((state) => ({
    classPaths: state.classPaths.map(cp => {
      if (cp.id === classPathId) {
        return {
          ...cp,
          nodes: cp.nodes.map(n => n.id === nodeId ? { ...n, ...updates } : n)
        }
      }
      return cp
    })
  })),
  
  deleteNode: (classPathId, nodeId) => set((state) => ({
    classPaths: state.classPaths.map(cp => {
      if (cp.id === classPathId) {
        return {
          ...cp,
          nodes: cp.nodes.filter(n => n.id !== nodeId)
        }
      }
      return cp
    })
  })),
  
  setActiveClass: (classPathId) => set({ activeClassId: classPathId }),
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setResourceFilter: (filter) => set({ resourceFilter: filter }),
  toggleNodeCreation: () => set((state) => ({ isNodeCreationOpen: !state.isNodeCreationOpen })),
  
  openLectureModal: (nodeId) => set({ 
    isLectureModalOpen: true, 
    lectureModalNodeId: nodeId 
  }),
  
  closeLectureModal: () => set({ 
    isLectureModalOpen: false, 
    lectureModalNodeId: null 
  }),
  
  calculateWorkflowHealth: (subjectId) => {
    const state = get()
    const classPath = state.classPaths.find(cp => cp.subjectId === subjectId)
    if (!classPath || classPath.nodes.length === 0) return 'green'
    
    const completedCount = classPath.nodes.filter(n => n.completed).length
    const percentage = (completedCount / classPath.nodes.length) * 100
    
    if (percentage >= 75) return 'green'
    if (percentage >= 50) return 'yellow'
    return 'red'
  },
  
  // Actions
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleCommandPalette: () => set((state) => ({ isCommandPaletteOpen: !state.isCommandPaletteOpen })),
  openResourceDrawer: (id) => set({ isResourceDrawerOpen: true, selectedResourceId: id }),
  closeResourceDrawer: () => set({ isResourceDrawerOpen: false, selectedResourceId: null }),
}))
