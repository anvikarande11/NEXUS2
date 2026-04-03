'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Link2, Video, StickyNote, Plus } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function UploadResourceModal() {
  const { isUploadOpen, closeUpload, addNode } = useDashboardStore()
  const [dragActive, setDragActive] = useState(false)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [resourceName, setResourceName] = useState('')

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file drop here
  }

  const handleCreateNode = () => {
    if (selectedClass && resourceName.trim()) {
      addNode(selectedClass, resourceName)
      setResourceName('')
      closeUpload()
    }
  }

  return (
    <AnimatePresence>
      {isUploadOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg"
          >
            {/* Header */}
            <div className="border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Upload Resource
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Add materials to your mastery path
                </p>
              </div>
              <button
                onClick={closeUpload}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Select Class */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Select Subject
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Choose a subject...</option>
                  <option value="cp-1">DBMS</option>
                  <option value="cp-2">DSA</option>
                  <option value="cp-3">Operating Systems</option>
                  <option value="cp-4">Computer Networks</option>
                  <option value="cp-5">Machine Learning</option>
                  <option value="cp-6">Mathematics</option>
                </select>
              </div>

              {/* Drag Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/30 hover:border-primary/50'
                }`}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-card-foreground">
                  Drop files or click to upload
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDFs, images, links supported
                </p>
              </div>

              {/* Resource Name */}
              <div>
                <label className="text-sm font-medium text-card-foreground mb-2 block">
                  Resource Name (or node title)
                </label>
                <Input
                  value={resourceName}
                  onChange={(e) => setResourceName(e.target.value)}
                  placeholder="e.g., Binary Search Tree Fundamentals"
                  className="bg-muted/50 border-border text-sm"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 transition-colors">
                  <StickyNote className="w-4 h-4" />
                  Add Note
                </button>
                <button className="p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border text-sm font-medium text-muted-foreground flex items-center justify-center gap-2 transition-colors">
                  <Link2 className="w-4 h-4" />
                  Add Link
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-4 flex gap-2 justify-end bg-muted/20">
              <Button variant="outline" onClick={closeUpload}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateNode}
                disabled={!selectedClass || !resourceName.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Node
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
