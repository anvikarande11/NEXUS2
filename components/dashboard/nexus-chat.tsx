'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Loader } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const mockResponses = [
  "That's a great question! Let me help you break this down...",
  "Based on your ClassPath progress, I'd recommend focusing on this next...",
  "I noticed you're struggling with this concept. Here's a simpler explanation...",
  "Excellent progress! You're 85% done with this mastery path...",
  "This is related to something you learned earlier. Remember when...",
  "I recommend reviewing the fundamentals before moving forward...",
]

export function NexusChat() {
  const { isChatOpen, toggleChat, chatMessages, addChatMessage } = useDashboardStore()
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    addChatMessage({
      role: 'user',
      content: input
    })
    setInput('')

    // Simulate AI response delay
    setIsLoading(true)
    setTimeout(() => {
      addChatMessage({
        role: 'assistant',
        content: mockResponses[Math.floor(Math.random() * mockResponses.length)]
      })
      setIsLoading(false)
    }, 800)
  }

  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="fixed bottom-6 right-6 z-40 w-96 bg-card border border-border rounded-2xl shadow-2xl flex flex-col h-[32rem]"
        >
          {/* Header */}
          <div className="border-b border-border p-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-transparent rounded-t-2xl">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-card-foreground">Nexus AI</h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Hi! I&apos;m your AI study companion. Ask me anything about your courses!
                </p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-xs">Thinking...</span>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2 bg-muted/20 rounded-b-2xl">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Nexus..."
              className="text-sm bg-background/50"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
