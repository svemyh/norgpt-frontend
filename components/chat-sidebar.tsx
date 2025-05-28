"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { Settings, User, Plus, Calendar, Home, Inbox, Search } from "lucide-react"

// Menu items
const items = [
  {
    title: "Ny chat",
    url: "#",
    icon: Plus,
  },
  {
    title: "Hjem",
    url: "#",
    icon: Home,
  },
  {
    title: "Innboks",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Søk",
    url: "#",
    icon: Search,
  },
  {
    title: "Kalender",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Innstillinger",
    url: "#",
    icon: Settings,
  },
]

interface ChatGroup {
  title: string
  chats: {
    id: string
    title: string
  }[]
}

export function ChatSidebar() {
  // Sample chat history data
  const chatGroups: ChatGroup[] = [
    {
      title: "I dag",
      chats: [
        { id: "1", title: "Hjelp med programmering" },
        { id: "2", title: "Skriv en e-post" },
      ],
    },
    {
      title: "I går",
      chats: [
        { id: "3", title: "Oversett tekst" },
        { id: "4", title: "Lag en oppskrift" },
      ],
    },
    {
      title: "Forrige uke",
      chats: [
        { id: "5", title: "Hjelp med matematikk" },
        { id: "6", title: "Planlegg en reise" },
      ],
    },
  ]

  return (
    <Sidebar variant="floating" collapsible="offcanvas">
      <SidebarHeader>
        <div className="p-2 pl-4">
          <h1 className="font-semibold text-xl">NorGPT</h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="pl-2">
        {/* Main actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Handlinger</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Chat history */}
        {chatGroups.map((group, idx) => (
          <SidebarGroup key={idx}>
            <SidebarGroupLabel>
              <span>{group.title}</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton asChild tooltip={chat.title}>
                      <a href={`#${chat.id}`} className="flex items-center">
                        <span className="truncate">{chat.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="pl-2">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start gap-3 h-12">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Bruker</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
