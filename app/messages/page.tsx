"use client"

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationBar } from "@/components/navigation-bar";
import { Search, Send, Check, CheckCheck } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow, format, isToday, isYesterday, startOfDay } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error: any) {
      console.error("Error fetching conversations:", error);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data.messages || []);
    } catch (error: any) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;
    setSending(true);
    try {
      const response = await api.post('/messages/send', {
        receiverId: selectedChat,
        message: newMessage.trim()
      });
      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        await fetchConversations();
        setNewMessage("");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.response?.data?.error || "Failed to send message", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSelectChat = async (userId: string) => {
    setSelectedChat(userId);
    await fetchMessages(userId);
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(async () => {
      if (selectedChat) await fetchMessages(selectedChat);
      await fetchConversations();
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (user) {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const identity = typeof payload.sub === 'string' && payload.sub.startsWith('{')
            ? JSON.parse(payload.sub)
            : payload.sub;
          const userId = identity?.userId || identity?.id;
          console.log('userId from token:', userId);
          setCurrentUserId(userId);
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && currentUserId) {
      setLoading(true);
      fetchConversations().finally(() => setLoading(false));
      startPolling();
    }
    return () => stopPolling();
  }, [user, currentUserId]);

  useEffect(() => {
    if (selectedChat) startPolling();
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filteredConversations = conversations.filter(conv =>
    conv.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (timestamp: string) => {
    try { return formatDistanceToNow(new Date(timestamp), { addSuffix: true }); }
    catch { return "Recently"; }
  };

  const isMyMessage = (message: Message) => {
    return message.senderId === currentUserId;
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(message => {
      try {
        const messageDate = startOfDay(new Date(message.timestamp));
        let dateKey = isToday(messageDate) ? "Today" : isYesterday(messageDate) ? "Yesterday" : format(messageDate, "MMM d, yyyy");
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(message);
      } catch {
        if (!groups["Earlier"]) groups["Earlier"] = [];
        groups["Earlier"].push(message);
      }
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations List */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-10" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="space-y-2">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No conversations yet</p>
                  <p className="text-sm">Start a conversation by applying to jobs or posting jobs</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <Card key={conversation.id} className={`cursor-pointer hover:bg-accent transition-colors ${selectedChat === conversation.id ? "bg-accent" : ""}`} onClick={() => handleSelectChat(conversation.id)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{conversation.userName}</h3>
                            <span className="text-xs px-2 py-1 bg-muted rounded-full">{conversation.userRole}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                          <p className="text-xs text-muted-foreground">{conversation.userEmail}</p>
                        </div>
                        <div className="text-xs text-muted-foreground ml-2 flex flex-col items-end">
                          <span>{formatTimestamp(conversation.timestamp)}</span>
                          {conversation.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs mt-1">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            {selectedChat ? (
              <div className="h-[calc(100vh-12rem)] flex flex-col border border-border rounded-lg">
                <div className="p-4 border-b">
                  <h2 className="font-medium">{conversations.find(c => c.id === selectedChat)?.userName || "Unknown User"}</h2>
                  <p className="text-sm text-muted-foreground">{conversations.find(c => c.id === selectedChat)?.userRole}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-background">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(groupMessagesByDate(messages)).map(([dateLabel, dateMessages]) => (
                        <div key={dateLabel}>
                          <div className="flex items-center justify-center my-4">
                            <div className="bg-muted px-3 py-1 rounded-full">
                              <span className="text-xs text-muted-foreground font-medium">{dateLabel}</span>
                            </div>
                          </div>
                          {dateMessages.map((message) => {
                            const sent = isMyMessage(message);
                            return (
                              <div key={message.id} className={`flex mb-2 ${sent ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-xs lg:max-w-md ${sent ? "ml-auto" : "mr-auto"}`}>
                                  <div className={`rounded-2xl px-4 py-2 shadow-sm ${sent ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                                    <p className="text-sm break-words">{message.message}</p>
                                  </div>
                                  <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${sent ? "justify-end" : "justify-start"}`}>
                                    <span>{formatTimestamp(message.timestamp)}</span>
                                    {sent && (message.read ? <CheckCheck className="h-3 w-3 ml-1" /> : <Check className="h-3 w-3 ml-1" />)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                      disabled={sending}
                    />
                    <Button onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[calc(100vh-12rem)] flex items-center justify-center text-muted-foreground border border-border rounded-lg">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Select a conversation</p>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <NavigationBar />
    </div>
  );
}