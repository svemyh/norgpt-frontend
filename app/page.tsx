// app/page.tsx

"use client"

import React, { useState, useEffect, useRef } from "react"
import { PromptInputBox } from "@/components/ui/ai-prompt-box"
import { MessageLoading } from "@/components/ui/message-loading"
import { useAnimatedText } from "@/components/ui/animated-text"
// Ensure all necessary icons are imported, including those for the sidebar
import { Copy, Check, User, ChevronsUpDown, Calendar, Home as HomeIcon, Inbox, Search, Settings, MessageSquareText, FileText, HelpCircle, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip" // Ensure this path is correct

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
  SidebarSeparator,
  useSidebar, // Import useSidebar hook
} from "@/components/ui/sidebar" // Ensure this path is correct and sidebar.tsx is in components/ui

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  isAnimating?: boolean
  isError?: boolean
}

function AnimatedMessage({ content, isAnimating }: { content: string; isAnimating: boolean }) {
  const animatedText = useAnimatedText(isAnimating ? content : "", "")
  return <div className="whitespace-pre-wrap">{isAnimating ? animatedText : content}</div>
}

// Custom animation hook for fade-in effect
function useFadeIn(delay = 0) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  return {
    opacity: isMounted ? 1 : 0,
    transition: `opacity 0.5s ease-in-out ${delay}ms`
  };
}

// Custom hook for managing model selection with visual feedback
function useModelSelection(initialModel = "standard") {
  const [selectedModel, setSelectedModelState] = useState<string>(initialModel);
  const [selectedModelName, setSelectedModelName] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle model selection with visual feedback
  const setSelectedModel = (modelId: string, modelName: string) => {
    setSelectedModelState(modelId);
    setSelectedModelName(modelName);
    setShowFeedback(true);
    
    // Keep dropdown open briefly to provide visual feedback
    setTimeout(() => {
      setIsOpen(false); // Close the dropdown after delay
      
      // Reset feedback after another delay
      setTimeout(() => {
        setShowFeedback(false);
      }, 1000);
    }, 600);
  };
  
  return {
    selectedModel,
    selectedModelName,
    showFeedback,
    isOpen,
    setIsOpen,
    setSelectedModel
  };
}

// Create a model context to share state between desktop and mobile model selectors
const ModelContext = React.createContext<{
  selectedModel: string;
  selectedModelName: string;
  showFeedback: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setSelectedModel: (modelId: string, modelName: string) => void;
}>({ 
  selectedModel: "standard", 
  selectedModelName: "",
  showFeedback: false,
  isOpen: false,
  setIsOpen: () => {},
  setSelectedModel: () => {} 
});

// Example sidebar menu items - "Ny chat" will be separate, "Innstillinger" moved to footer
const sidebarMenuItems = []

const footerMenuItems = [
  { title: "Innstillinger", url: "#", icon: Settings },
  { title: "Vilkår", url: "#", icon: FileText },
  { title: "Hjelp", url: "#", icon: HelpCircle },
];

// Example chat history data
const chatHistory = [
  {
    label: "I dag",
    chats: [
      { title: "Hjelp med programmering", url: "#" },
      { title: "Skriv en e-post", url: "#" },
    ],
  },
  {
    label: "I går",
    chats: [
      { title: "Oversett tekst", url: "#" },
      { title: "Lag en oppskrift", url: "#" },
    ],
  },
  {
    label: "Forrige uke",
    chats: [
      { title: "Hjelp med matematikk", url: "#" },
      { title: "Planlegg en reise", url: "#" },
    ],
  },
  {
    label: "Forrige måned",
    chats: [
      { title: "Skriv en historie", url: "#" },
      { title: "Lag en presentasjon", url: "#" },
      { title: "Sammendrag av artikkel", url: "#" },
      { title: "Hjelp med CV", url: "#" },
      { title: "Oversett dokumenter", url: "#" },
      { title: "Budsjettplanlegging", url: "#" },
      { title: "SEO-optimalisering", url: "#" },
      { title: "Markedsføringsplan", url: "#" },
      { title: "Prosjektledelse tips", url: "#" },
      { title: "Treningsprogram", url: "#" },
      { title: "Matlaging og oppskrifter", url: "#" },
      { title: "Ferieplanlegging", url: "#" },
    ],
  },
];

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
      suppressHydrationWarning
    >
      {children} {/* Inner content (e.g., max-w-3xl mx-auto) will center within this adjusted space */}
    </div>
  );
};

// New MobileTopBar component
const MobileTopBar: React.FC = () => {
  const { isMobile } = useSidebar();
  const fadeStyle = useFadeIn(300);
  const { 
    selectedModel, 
    selectedModelName,
    showFeedback,
    isOpen, 
    setIsOpen,
    setSelectedModel 
  } = React.useContext(ModelContext);
  // State to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  
  // Use effect to mark component as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Models available for selection - shared constants
  const models = [
    { id: "rask", name: "NorGPT: rask" },
    { id: "standard", name: "NorGPT: standard" },
    { id: "tenkende", name: "NorGPT: tenkende" },
  ];

  if (!isMobile || !mounted) {
    return null; // Don't render on desktop or during SSR
  }

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between bg-background/80 px-4 backdrop-blur-sm md:hidden"
      style={{
        ...fadeStyle,
        // Remove border when selected/highlighted (transparent border color)
        outlineColor: 'transparent',
        borderBottom: '1px solid transparent',
        boxShadow: 'none'
      }}
    >
      <div className="flex items-center gap-3">
        <SidebarTrigger />
      </div>
      
      {/* Model Selection Dropdown - simplified for mobile with visual feedback */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-10 px-2 gap-1">
            <ChevronDown className="h-4 w-4 mr-1" />
            <span className="text-2xl font-semibold">NorGPT</span>
            {showFeedback && (
              <span 
                className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-1 transition-opacity"
                style={{ opacity: showFeedback ? 1 : 0, transition: 'opacity 300ms ease-out' }}
              >
                {selectedModelName.split(': ')[1]}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="transition-opacity duration-300"
          style={{ opacity: isOpen ? 1 : 0 }}
        >
          {models.map(model => (
            <DropdownMenuItem 
              key={model.id} 
              className={cn(
                "text-base transition-colors duration-200",
                model.id === selectedModel && "bg-primary/10"
              )}
              onClick={() => setSelectedModel(model.id, model.name)}
            >
              <span className="flex items-center">
                <span className={cn(
                  "w-4 h-4 mr-2 flex-shrink-0",
                  model.id === selectedModel ? "opacity-100" : "opacity-0"
                )}>
                  {model.id === selectedModel && <Check className="h-4 w-4" />}
                </span>
                {model.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

// Sidebar Controls component - Client-only with useEffect to prevent hydration mismatches
const SidebarControls: React.FC = () => {
  const { state } = useSidebar();
  // State for tracking the selected model - from context
  const { 
    selectedModel, 
    selectedModelName, 
    showFeedback, 
    isOpen, 
    setIsOpen, 
    setSelectedModel 
  } = React.useContext(ModelContext);
  // State to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  const fadeStyle = useFadeIn(600); // Slightly delayed fade in
  
  // Use effect to mark component as mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Models available for selection - shared constants
  const models = [
    { id: "rask", name: "NorGPT: rask" },
    { id: "standard", name: "NorGPT: standard" },
    { id: "tenkende", name: "NorGPT: tenkende" },
  ];
  
  // Get the current model name for display
  const currentModel = models.find(model => model.id === selectedModel)?.name || models[1].name;
  
  // Don't render anything during server-side rendering or initial hydration
  if (!mounted) {
    return null;
  }
  
  return (
    <div 
      className="absolute top-4 left-4 z-30 hidden md:flex items-center gap-2"
      style={{
        ...fadeStyle,
        // Remove border when selected/highlighted
        outlineColor: 'transparent',
        borderColor: 'transparent',
        boxShadow: 'none'
      }}
    > {/* Adjust as needed, hide on mobile */}
      <SidebarTrigger />
      
      {/* New Chat Button - Only visible when sidebar is collapsed */}
      {state === "collapsed" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10" 
                onClick={() => window.location.href="/"}
                style={fadeStyle}
              >
                <MessageSquareText className="h-6 w-6" />
                <span className="sr-only">Ny chat</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Ny chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Model Selection Dropdown - with visual feedback */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-10 gap-1 px-3 transition-colors", 
              showFeedback && "bg-primary/10"
            )}
          >
            <span className="text-base font-medium">{currentModel}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end"
          className="transition-opacity duration-300"
          style={{ opacity: isOpen ? 1 : 0 }}
        >
          {models.map(model => (
            <DropdownMenuItem 
              key={model.id} 
              className={cn(
                "text-base transition-colors duration-200",
                model.id === selectedModel && "bg-primary/10"
              )}
              onClick={() => setSelectedModel(model.id, model.name)}
            >
              <span className="flex items-center">
                <span className={cn(
                  "w-4 h-4 mr-2 flex-shrink-0",
                  model.id === selectedModel ? "opacity-100" : "opacity-0"
                )}>
                  {model.id === selectedModel && <Check className="h-4 w-4" />}
                </span>
                {model.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function HomePage() { // Renamed to HomePage to avoid conflict with HomeIcon
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [sidebarMounted, setSidebarMounted] = useState(false)
  const modelSelection = useModelSelection("standard")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Pre-calculate fade styles at component level to avoid conditional hook calls
  const nyChatFadeStyle = useFadeIn(400)
  
  // Use effect to handle animations after component mounts
  useEffect(() => {
    setMounted(true);
    setSidebarMounted(true);
  }, [])
  // We'll use this for the sidebar controls

  const hasMessages = messages.length > 0

  const simulateResponse = async (message: string) => {
    setLoading(true)
    
    try {
      // Build chat history for context
      const historyMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new message
      const apiMessages = [
        ...historyMessages,
        { role: 'user', content: message }
      ];
      
      // Call our API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiMessages }),
      });
      
      const data = await response.json();
      
      // Check if the response contains an error
      if (!response.ok || data.error) {
        // Simple info logging instead of error
        console.log('API issue:', data.error || response.statusText);
        return {
          content: 'Beklager, det oppstod en feil under kommunikasjon med AI-tjenesten. Vennligst prøv igjen senere.',
          isError: true
        };
      }
      
      return {
        content: data.choices[0].message.content,
        isError: false
      };
    } catch (error) {
      // Simple info logging instead of error
      console.log('API call issue:', error);
      return {
        content: 'Beklager, det oppstod en feil under kommunikasjon med AI-tjenesten. Vennligst prøv igjen senere.',
        isError: true
      };
    } finally {
      setLoading(false);
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: message }
    setMessages((prev) => [...prev, userMessage])
    const response = await simulateResponse(message)
    const aiMessage: Message = { 
      id: (Date.now() + 1).toString(), 
      role: "assistant", 
      content: response.content, 
      isAnimating: true,
      isError: response.isError
    }
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
    <ModelContext.Provider value={modelSelection}>
    <TooltipProvider>
      {sidebarMounted ? (
        <SidebarProvider defaultOpen={false}> {/* SidebarProvider with defaultOpen=false for new users */}
        <Sidebar> {/* The actual Sidebar component */}
          <SidebarContent> {/* Removed className="flex flex-col" */}
            {/* Standalone "Ny chat" button at the top */}
            {/* For mobile, this div will be the first child picked up by SheetContent */}
            {/* For desktop, it's just the first item in the sidebar flow */}
            <div className="md:p-2" style={nyChatFadeStyle}> {/* Removed p-2 for mobile, keep for desktop. Mobile header in sidebar.tsx has p-2 */}
              <SidebarMenuButton asChild tooltip="Ny chat" className="md:w-full text-sm font-bold"> {/* md:w-full so it's auto-width on mobile */}
                <a href="/"><span className="flex items-center gap-2"><MessageSquareText /><span>Ny chat</span></span></a>
              </SidebarMenuButton>
            </div>

            {/* Chat History Sections - takes remaining flexible space */}
            {/* On mobile, this div starts from the second child picked by SheetContent */}
            {/* On desktop, it flows after the Ny Chat button */}
            <div className="flex-grow overflow-y-auto">
              {chatHistory.map((group) => (
                <SidebarGroup key={group.label}>
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.chats.map((chat) => (
                        <SidebarMenuItem key={chat.title}>
                          <SidebarMenuButton asChild tooltip={chat.title} className="text-sm font-normal">
                            <a href={chat.url}><span>{chat.title}</span></a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </div>
          </SidebarContent>
          <SidebarFooter>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarMenu>
                {footerMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <a href={item.url}><span className="flex items-center gap-2"><item.icon /><span>{item.title}</span></span></a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarMenuButton className="w-full justify-between gap-3 h-12">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 rounded-md" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Ola Nordmann</span>
                    <span className="text-xs text-muted-foreground">ola@example.com</span>
                  </div>
                </div>
                <ChevronsUpDown className="h-5 w-5 rounded-md" />
              </SidebarMenuButton>
            </SidebarGroup>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset> {/* SidebarInset wraps your main page content */}
          <MobileTopBar /> {/* Add the mobile top bar here */}
          <div className="w-full min-h-screen bg-background">
            {/* Sidebar Controls component will be rendered here, where the SidebarProvider context is available */}
            <SidebarControls />

            {/* Main content area */}
            <div className="flex-1 flex flex-col h-screen pb-36 pt-16 md:pt-0"> {/* Changed pt-14 to pt-16 for mobile */}
              {/* Messages area */}
              <div className="flex-1 overflow-y-auto w-full pt-4 md:pt-12"> {/* Adjusted pt-12 for mobile, existing pt-12 for desktop was fine for content start below trigger */}
                {!hasMessages ? (
                  <div className="flex items-center justify-center h-full w-full">
                    <div className="text-center max-w-xl mx-auto">
                      <div className="transform transition-all duration-700 ease-out" 
                         style={{
                           opacity: mounted ? 1 : 0,
                           transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                           transition: 'opacity 0.7s ease-out, transform 0.7s ease-out'
                         }}
                      >
                        <h1 className="text-3xl font-semibold">Hva kan jeg hjelpe med i dag?</h1>
                      </div>
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
                                  : message.isError
                                    ? "bg-red-50 border-2 border-red-500 text-gray-800 px-4 py-3 whitespace-pre-wrap"
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
      ) : (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          {/* Simple loading state while we wait for client-side render */}
          <div className="animate-pulse">Loading...</div>
        </div>
      )}
    </TooltipProvider>
    </ModelContext.Provider>
  )
}