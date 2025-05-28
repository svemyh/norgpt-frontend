"use client"

import { useState, useEffect, useRef } from "react"
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { MessageLoading } from "@/components/ui/message-loading"
import { useAnimatedText } from "@/components/ui/animated-text"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isAnimating?: boolean
}

// Component for animated AI message
function AnimatedMessage({ content, isAnimating }: { content: string; isAnimating: boolean }) {
  const animatedText = useAnimatedText(isAnimating ? content : "", "")

  return <div className="whitespace-pre-wrap">{isAnimating ? animatedText : content}</div>
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hasMessages = messages.length > 0

  // Simulate backend response
  const simulateResponse = async (message: string) => {
    setLoading(true)
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    return "Hello! I'm your AI assistant. How can I help you today?\n\nI can assist you with a wide variety of tasks including:\n\n• Answering questions\n• Writing and editing\n• Problem solving\n• Creative projects\n• Research and analysis\n\nFeel free to ask me anything!"
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    }
    setMessages((prev) => [...prev, userMessage])

    // Get AI response
    const response = await simulateResponse(message)

    // Add AI response with animation
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      isAnimating: true,
    }
    setMessages((prev) => [...prev, aiMessage])

    // Stop animation after 300ms (fixed duration)
    setTimeout(() => {
      setMessages((prev) => prev.map((msg) => (msg.id === aiMessage.id ? { ...msg, isAnimating: false } : msg)))
    }, 300)
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Get the last assistant message
  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Main content area - always centered in full viewport */}
      <div className="flex-1 flex flex-col h-screen pb-36">
        {/* Messages area - scrollable and centered in full width */}
        <div className="flex-1 overflow-y-auto w-full">
          {!hasMessages ? (
            /* Welcome message when no chat history */
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center max-w-xl mx-auto">
                <h1 className="text-3xl font-semibold">Hva kan jeg hjelpe med i dag?</h1>
              </div>
            </div>
          ) : (
            /* Chat messages - centered in full viewport width */
            <div className="py-10 w-full">
              <div className="max-w-3xl mx-auto px-4 md:px-8">
                {messages.map((message) => (
                  <div key={message.id} className="mb-6">
                    <div
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start flex-col items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl",
                          message.role === "user"
                            ? "bg-gray-200 text-gray-800 px-4 py-3 whitespace-pre-wrap"
                            : "bg-transparent text-gray-800 px-0 py-0",
                        )}
                      >
                        {message.role === "assistant" ? (
                          <AnimatedMessage content={message.content} isAnimating={message.isAnimating || false} />
                        ) : (
                          message.content
                        )}
                      </div>
                      {message.role === "assistant" && message.id === lastAssistantMessage?.id && (
                        <button
                          onClick={() => copyToClipboard(message.content, message.id)}
                          className="mt-1 ml-0 p-1.5 rounded-md hover:bg-gray-100 transition-colors group"
                          title="Copy to clipboard"
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start mb-6">
                    <div className="bg-transparent rounded-2xl px-0 py-0">
                      <MessageLoading />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed input area - centered in full viewport width */}
      <div className="fixed bottom-8 left-0 right-0 z-20 w-full">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <PromptInputBox onSend={handleSendMessage} isLoading={loading} placeholder="Spør om hva som helst" />
        </div>
      </div>

      {/* Fixed disclaimer footer - centered in full viewport width */}
      <div className="fixed bottom-0 left-0 right-0 text-center py-2 z-20 w-full">
        <p className="text-xs text-gray-500">NorGPT kan gjøre feil. Alltid sjekk viktig informasjon.</p>
      </div>
    </div>
  )
}
