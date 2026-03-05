"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Send } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

interface ChatRoomProps {
  roomId: string;
  currentUserId: string;
  className?: string;
}

export function ChatRoom({ roomId, currentUserId, className }: ChatRoomProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);
  const hasScrolledRef = useRef(false);

  // Fetch initial messages
  const { data, isLoading } = trpc.chat.getMessages.useQuery(
    { roomId, limit: 50 },
    { refetchInterval: 2000 }
  );

  // Online members
  const { data: onlineMembers } = trpc.chat.getOnlineMembers.useQuery(
    { roomId },
    { refetchInterval: 10000 }
  );

  // Send message mutation
  const utils = trpc.useUtils();
  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.getMessages.invalidate({ roomId });
    },
  });

  // Mark seen for presence
  const markSeen = trpc.chat.markSeen.useMutation();

  // Mark seen on mount and every 10 seconds
  useEffect(() => {
    markSeen.mutate({ roomId });
    const interval = setInterval(() => {
      markSeen.mutate({ roomId });
    }, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const messages = data?.messages ?? [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length === 0) return;
    const lastId = messages[messages.length - 1]?.id;
    if (lastId !== lastMessageIdRef.current || !hasScrolledRef.current) {
      lastMessageIdRef.current = lastId ?? null;
      hasScrolledRef.current = true;
      scrollRef.current?.scrollIntoView({ behavior: hasScrolledRef.current ? "smooth" : "auto" });
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sendMessage.mutate({ roomId, content: text });
    setInput("");
  }, [input, roomId, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  if (isLoading) {
    return (
      <div className={cn("flex h-full flex-col rounded-lg border", className)}>
        <div className="border-b px-4 py-3">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="flex-1 space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full flex-col rounded-lg border", className)}>
      {/* Header with online count */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          {(onlineMembers?.length ?? 0) > 0 && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {onlineMembers?.length ?? 0} online
          </span>
        </div>
        <div className="flex -space-x-1">
          {onlineMembers?.slice(0, 5).map((member) => (
            <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
              <AvatarImage src={member.image ?? undefined} />
              <AvatarFallback className="text-[10px]">
                {(member.name ?? "?")[0]}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No messages yet. Say hello!
            </p>
          )}
          {messages.map((msg) => {
            const isOwn = msg.user.id === currentUserId;
            return (
              <div key={msg.id} className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={msg.user.image ?? undefined} />
                  <AvatarFallback className="text-xs">
                    {(msg.user.name ?? "?")[0]}
                  </AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[75%]", isOwn && "text-right")}>
                  <div className={cn("flex items-baseline gap-2", isOwn && "flex-row-reverse")}>
                    <span className="text-xs font-medium">{msg.user.name ?? "Unknown"}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(msg.createdAt)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-0.5 inline-block rounded-lg px-3 py-1.5 text-sm",
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={handleKeyDown}
            disabled={sendMessage.isPending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
