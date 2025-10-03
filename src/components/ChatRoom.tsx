import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, LogOut, Users, Circle, MessageSquare } from "lucide-react";
import { tokenizeLinks } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import FileUpload from "@/components/FileUpload";
import FilePreview from "@/components/FilePreview";

interface Message {
  id: string;
  text: string;
  userId: string;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

interface ChatRoomProps {
  roomCode: string;
  onLeaveRoom: () => void;
}

const ChatRoom = ({ roomCode, onLeaveRoom }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [userId] = useState(() => Math.random().toString(36).substring(7));
  const [pendingFile, setPendingFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a channel for this specific room
    const channel = supabase.channel(`room:${roomCode}`, {
      config: {
        broadcast: { self: true },
        presence: { key: userId }
      }
    });

    // Track presence (users in room)
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setUserCount(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages((prev) => [...prev, payload as Message]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
          toast({
            title: "Connected!",
            description: `Joined room: ${roomCode}`,
          });
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [roomCode, userId, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if ((!inputMessage.trim() && !pendingFile) || !channelRef.current) return;

    const message: Message = {
      id: Math.random().toString(36),
      text: inputMessage.trim(),
      userId,
      timestamp: Date.now(),
      ...(pendingFile && {
        fileUrl: pendingFile.url,
        fileName: pendingFile.name,
        fileType: pendingFile.type,
      }),
    };

    await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });

    setInputMessage("");
    setPendingFile(null);
  };

  const handleFileUploaded = (url: string, name: string, type: string) => {
    setPendingFile({ url, name, type });
  };

  const handleLeave = () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    onLeaveRoom();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      {/* Header (fixed) */}
      <div className="bg-card/80 backdrop-blur-xl border-b border-border/50 p-4 fixed inset-x-0 top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
              <span className="font-mono text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {roomCode}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span className="text-sm">{userCount} online</span>
            </div>
          </div>
          <Button
            onClick={handleLeave}
            variant="outline"
            size="sm"
            className="border-destructive/30 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      {/* Messages - only this area should scroll (add top/bottom padding so fixed header/footer don't cover content) */}
      <div className="flex-1 relative z-10 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 w-full pt-16 pb-16">
          <div className="max-w-4xl mx-auto space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12 animate-fade-in">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === userId ? "justify-end" : "justify-start"} animate-slide-in`}
                >
                  <Card
                    className={`max-w-[70%] p-3 ${
                      msg.userId === userId
                        ? "bg-gradient-to-br from-primary to-accent text-primary-foreground border-0 shadow-lg"
                        : "bg-card/80 backdrop-blur-sm border-border/50"
                    }`}
                  >
                    {msg.fileUrl && (
                      <div className="mb-2">
                        <FilePreview
                          url={msg.fileUrl}
                          fileName={msg.fileName || 'file'}
                          fileType={msg.fileType || 'application/octet-stream'}
                          isOwn={msg.userId === userId}
                        />
                      </div>
                    )}
                    {msg.text && (
                      <p className="text-sm break-words">
                        {tokenizeLinks(msg.text).map((t, i) =>
                          t.type === 'url' ? (
                            <a key={i} href={t.value} target="_blank" rel="noopener noreferrer" className="text-blue-700 dark:text-blue-300 underline">
                              {t.value}
                            </a>
                          ) : (
                            <span key={i}>{t.value}</span>
                          )
                        )}
                      </p>
                    )}
                    <p className={`text-xs mt-1 ${msg.userId === userId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </Card>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input / Footer (fixed) */}
      <div className="bg-card/80 backdrop-blur-xl border-t border-border/50 p-4 fixed inset-x-0 bottom-0 z-50">
        <div className="max-w-4xl mx-auto flex gap-2 items-end">
          <FileUpload onFileUploaded={handleFileUploaded} externalPreview={pendingFile} />
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="bg-muted/50 border-border/50 focus:border-primary transition-all"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!inputMessage.trim() && !pendingFile}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg h-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
