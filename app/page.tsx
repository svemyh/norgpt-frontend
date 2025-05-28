// app/page.tsx

"use client"

import { useState, useEffect, useRef } from "react"
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { MessageLoading } from "@/components/ui/message-loading"
import { useAnimatedText } from "@/components/ui/animated-text"
// Ensure all necessary icons are imported, including those for the sidebar
import { Copy, Check, User, ChevronsUpDown, Calendar, Home as HomeIcon, Inbox, Search, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip" // Ensure this path is correct

// Import all necessary Sidebar components and the useSidebar hook
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar, // Import useSidebar hook
} from "@/components/ui/sidebar" // Ensure this path is correct and sidebar.tsx is in components/ui

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isAnimating?: boolean
}

function AnimatedMessage({ content, isAnimating }: { content: string; isAnimating: boolean }) {
  const animatedText = useAnimatedText(isAnimating ? content : "", "")
  return <div className="whitespace-pre-wrap">{isAnimating ? animatedText : content}</div>
}

// Example sidebar menu items
const sidebarMenuItems = [
  { title: "Home", url: "#", icon: HomeIcon },
  { title: "Inbox", url: "#", icon: Inbox },
  { title: "Calendar", url: "#", icon: Calendar },
  { title: "Search", url: "#", icon: Search },
  { title: "Settings", url: "#", icon: Settings },
]

// Define sidebar width constants, matching those in sidebar.tsx
const SIDEBAR_WIDTH_DESKTOP_EXPANDED = "16rem";

// Helper component to adjust fixed elements based on sidebar state
interface AdjustableFixedContainerProps {
  children: React.ReactNode;
  className?: string;
  bottomOffsetClass: string; // e.g., "bottom-8" or "bottom-0"
}

const AdjustableFixedContainer: React.FC<AdjustableFixedContainerProps> = ({
  children,
  className,
  bottomOffsetClass,
}) => {
  const { open, isMobile } = useSidebar(); // Use 'open' and 'isMobile' from context

  let calculatedLeftOffset = '0px';

  if (!isMobile) {
    // On desktop: if the sidebar is open, apply its width as offset.
    // Assumes default <Sidebar collapsible="offcanvas"> behavior where it's 0px when closed.
    if (open) {
      calculatedLeftOffset = SIDEBAR_WIDTH_DESKTOP_EXPANDED;
    }
  }
  // On mobile, or when desktop sidebar is closed (offcanvas), left offset remains '0px'.

  const style: React.CSSProperties = {
    left: calculatedLeftOffset,
    right: '0px', // Span to the right edge of the viewport
  };

  return (
    <div
      className={cn(
        "fixed z-20 transition-all duration-300 ease-in-out", // For smooth movement
        bottomOffsetClass,
        className
      )}
      style={style}
    >
      {children} {/* Inner content (e.g., max-w-3xl mx-auto) will center within this adjusted space */}
    </div>
  );
};

export default function HomePage() { // Renamed to HomePage to avoid conflict with HomeIcon
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hasMessages = messages.length > 0

  const simulateResponse = async (message: string) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    return "Hello! I'm your AI assistant. How can I help you today?\n\nI can assist you with a wide variety of tasks including:\n\n• Answering questions\n• Writing and editing\n• Problem solving\n• Creative projects\n• Research and analysis\n\nFeel free to ask me anything!"
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: message }
    setMessages((prev) => [...prev, userMessage])
    const response = await simulateResponse(message)
    const aiMessage: Message = { id: (Date.now() + 1).toString(), role: "assistant", content: response, isAnimating: true }
    setMessages((prev) => [...prev, aiMessage])
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}> {/* SidebarProvider wraps everything */}
        <Sidebar> {/* The actual Sidebar component */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Application</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarGroup>
              <SidebarMenuButton className="w-full justify-between gap-3 h-12">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 rounded-md" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">john@example.com</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-5 w-5 rounded-md" />
              </SidebarMenuButton>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset> {/* SidebarInset wraps your main page content */}
          <div className="w-full min-h-screen bg-background">
            {/* Sidebar Trigger - Positioned absolutely within SidebarInset */}
            <div className="absolute top-4 left-4 z-30"> {/* Adjust as needed */}
              <SidebarTrigger />
            </div>

            {/* Main content area */}
            <div className="flex-1 flex flex-col h-screen pb-36">
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto w-full pt-12"> {/* Added pt-12 to avoid overlap with trigger */}
                {!hasMessages ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="text-center max-w-xl mx-auto">
                      <h1 className="text-3xl font-semibold">Hva kan jeg hjelpe med i dag?</h1>
                    </div>
                  </div>
                ) : (
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
                            {message.role === "assistant" && message.id === lastAssistantMessage?.id && !message.isAnimating && (
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

            {/* Fixed input area */}
            <AdjustableFixedContainer bottomOffsetClass="bottom-8" className="z-20">
              <div className="max-w-3xl mx-auto px-4 md:px-8">
                <PromptInputBox onSend={handleSendMessage} isLoading={loading} placeholder="Spør om hva som helst" />
              </div>
            </AdjustableFixedContainer>

            {/* Fixed disclaimer footer */}
            <AdjustableFixedContainer bottomOffsetClass="bottom-0" className="z-20 text-center py-2">
              <p className="text-xs text-gray-500">NorGPT kan gjøre feil. Alltid sjekk viktig informasjon.</p>
            </AdjustableFixedContainer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}