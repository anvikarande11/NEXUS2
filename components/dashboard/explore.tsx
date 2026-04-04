'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Star, 
  Sparkles, 
  Users, 
  Rocket,
  Brain,
  MessageSquare,
  GraduationCap,
  X,
  StickyNote,
  Trash2,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Event type definition
interface Event {
  id: string
  name: string
  date: string
  time: string
  location: string
  color: string
  icon: React.ReactNode
  description: string
  attendees?: number
}

// Note type
interface Note {
  id: string
  content: string
  color: string
  createdAt: Date
}

// Pre-defined events with fun colors
const initialEvents: Event[] = [
  {
    id: '1',
    name: 'Arcanes',
    date: '2026-04-15',
    time: '10:00 AM - 6:00 PM',
    location: 'Main Auditorium',
    color: '#FF6B6B',
    icon: <Rocket className="w-5 h-5" />,
    description: 'Annual tech fest with competitions, workshops & exhibitions',
    attendees: 450,
  },
  {
    id: '2', 
    name: 'Pre-Arcanes',
    date: '2026-04-10',
    time: '2:00 PM - 5:00 PM',
    location: 'Seminar Hall B',
    color: '#4ECDC4',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Warm-up events and registrations for Arcanes',
    attendees: 200,
  },
  {
    id: '3',
    name: 'Alumni Meet',
    date: '2026-04-20',
    time: '11:00 AM - 3:00 PM',
    location: 'Conference Center',
    color: '#A855F7',
    icon: <GraduationCap className="w-5 h-5" />,
    description: 'Connect with successful alumni and build your network',
    attendees: 150,
  },
  {
    id: '4',
    name: 'AI/ML Workshop',
    date: '2026-04-12',
    time: '9:00 AM - 1:00 PM',
    location: 'Lab 204',
    color: '#F59E0B',
    icon: <Brain className="w-5 h-5" />,
    description: 'Hands-on workshop on machine learning fundamentals',
    attendees: 80,
  },
  {
    id: '5',
    name: 'LinkedIn Chats',
    date: '2026-04-08',
    time: '4:00 PM - 6:00 PM',
    location: 'Virtual / Zoom',
    color: '#3B82F6',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'Professional networking tips & profile optimization',
    attendees: 120,
  },
]

// Color palette for new events
const eventColors = [
  '#FF6B6B', '#4ECDC4', '#A855F7', '#F59E0B', '#3B82F6', 
  '#EC4899', '#10B981', '#8B5CF6', '#F97316', '#06B6D4'
]

const noteColors = [
  '#FEF3C7', '#DBEAFE', '#FCE7F3', '#D1FAE5', '#E0E7FF', '#FED7AA'
]

// Add Event Modal
function AddEventModal({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean
  onClose: () => void
  onAdd: (event: Omit<Event, 'id'>) => void 
}) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(eventColors[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !date || !time) return

    onAdd({
      name,
      date,
      time,
      location,
      color: selectedColor,
      icon: <Star className="w-5 h-5" />,
      description,
      attendees: 0,
    })

    // Reset form
    setName('')
    setDate('')
    setTime('')
    setLocation('')
    setDescription('')
    setSelectedColor(eventColors[0])
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Add New Event
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Event Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g. 2:00 PM"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={2}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {eventColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-white scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Event Card Component
function EventCard({ event, index }: { event: Event; index: number }) {
  const eventDate = new Date(event.date)
  const isUpcoming = eventDate >= new Date()
  const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card hover:shadow-lg transition-all duration-300"
      style={{ 
        borderLeftWidth: '4px',
        borderLeftColor: event.color 
      }}
    >
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
        style={{ backgroundColor: event.color }}
      />

      <div className="p-4 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: event.color }}
            >
              {event.icon}
            </div>
            <div>
              <h4 className="font-bold text-foreground">{event.name}</h4>
              {isUpcoming && daysUntil > 0 && (
                <span 
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ 
                    backgroundColor: `${event.color}20`,
                    color: event.color 
                  }}
                >
                  In {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
          {event.attendees && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {event.attendees}
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {event.description}
        </p>

        {/* Date, Time, Location */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" style={{ color: event.color }} />
            <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" style={{ color: event.color }} />
            <span>{event.time}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" style={{ color: event.color }} />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Note Card Component
function NoteCard({ note, onDelete }: { note: Note; onDelete: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative p-3 rounded-lg shadow-sm group"
      style={{ backgroundColor: note.color }}
    >
      <button
        onClick={() => onDelete(note.id)}
        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10"
      >
        <Trash2 className="w-3 h-3 text-gray-600" />
      </button>
      <p className="text-sm text-gray-800 whitespace-pre-wrap pr-4">{note.content}</p>
      <p className="text-[10px] text-gray-500 mt-2">
        {note.createdAt.toLocaleDateString()}
      </p>
    </motion.div>
  )
}

export function Explore() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', content: 'Remember to submit hackathon registration!', color: noteColors[0], createdAt: new Date() },
    { id: '2', content: 'Prepare slides for AI/ML workshop', color: noteColors[2], createdAt: new Date() },
  ])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [selectedNoteColor, setSelectedNoteColor] = useState(noteColors[0])

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString(),
    }
    setEvents([...events, newEvent])
  }

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      color: selectedNoteColor,
      createdAt: new Date(),
    }
    setNotes([...notes, newNote])
    setNewNoteContent('')
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Explore
          </h2>
          <p className="text-sm text-muted-foreground">Upcoming events, workshops & your notes</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events Grid - 2 columns */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Events ({events.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          </div>

          {/* Notes Section - 1 column */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Quick Notes ({notes.length})
            </h3>

            {/* Add Note Input */}
            <div className="mb-4 p-3 bg-card border border-border rounded-xl">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Add a quick note..."
                className="w-full bg-transparent text-sm resize-none focus:outline-none min-h-[60px]"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1.5">
                  {noteColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedNoteColor(color)}
                      className={cn(
                        "w-5 h-5 rounded-full transition-all",
                        selectedNoteColor === color && "ring-2 ring-offset-1 ring-offset-background ring-primary scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={handleAddNote}
                  disabled={!newNoteContent.trim()}
                  className="h-7 px-2"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              <AnimatePresence>
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} onDelete={handleDeleteNote} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddEvent}
      />
    </div>
  )
}
