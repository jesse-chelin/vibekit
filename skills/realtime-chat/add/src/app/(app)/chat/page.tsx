"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ChatRoom } from "@/components/patterns/chat-room";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Plus, MessageSquare, ArrowLeft, Hash, Users } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";

export default function ChatPage() {
  const { data: session } = useSession();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: rooms, isLoading: roomsLoading } = trpc.chat.listRooms.useQuery(
    undefined,
    { refetchInterval: 5000 }
  );

  const utils = trpc.useUtils();

  const createRoom = trpc.chat.createRoom.useMutation({
    onSuccess: (room) => {
      utils.chat.listRooms.invalidate();
      setActiveRoomId(room.id);
      setNewRoomName("");
      setDialogOpen(false);
      toast.success(`"${room.name}" created!`);
    },
    onError: () => toast.error("Couldn't create the room. Try again?"),
  });

  const joinRoom = trpc.chat.joinRoom.useMutation({
    onSuccess: () => {
      utils.chat.listRooms.invalidate();
    },
  });

  const userId = session?.user?.id;
  const activeRoom = rooms?.find((r) => r.id === activeRoomId);

  // Mobile: show either room list or active chat
  const showChat = activeRoomId !== null;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <PageHeader
        title="Chat"
        description="Talk with your team in real time."
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a chat room</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newRoomName.trim()) {
                    createRoom.mutate({ name: newRoomName.trim() });
                  }
                }}
                className="flex gap-2"
              >
                <Input
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name..."
                  autoFocus
                />
                <Button type="submit" disabled={!newRoomName.trim() || createRoom.isPending}>
                  {createRoom.isPending ? "Creating..." : "Create"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex min-h-0 flex-1 gap-4">
        {/* Room list — hidden on mobile when chat is active */}
        <Card
          className={cn(
            "w-full flex-col md:flex md:w-72 md:shrink-0",
            showChat ? "hidden" : "flex"
          )}
        >
          <div className="border-b px-3 py-2">
            <h3 className="text-sm font-medium text-muted-foreground">Your Rooms</h3>
          </div>
          <ScrollArea className="flex-1">
            {roomsLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : rooms && rooms.length > 0 ? (
              <div className="p-1">
                {rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoomId(room.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted",
                      room.id === activeRoomId && "bg-muted"
                    )}
                  >
                    <Hash className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{room.name}</span>
                        <Badge variant="secondary" className="ml-1 shrink-0 text-[10px]">
                          <Users className="mr-0.5 h-2.5 w-2.5" />
                          {room.memberCount}
                        </Badge>
                      </div>
                      {room.lastMessage && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          <span className="font-medium">{room.lastMessage.senderName}:</span>{" "}
                          {room.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No rooms yet</p>
                <p className="text-xs text-muted-foreground">Create one to start chatting.</p>
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Active chat — full width on mobile */}
        <div className={cn("min-h-0 flex-1", !showChat && "hidden md:block")}>
          {activeRoomId && userId ? (
            <div className="flex h-full flex-col">
              {/* Mobile back button + room name */}
              <div className="mb-2 flex items-center gap-2 md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setActiveRoomId(null)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-medium">{activeRoom?.name ?? "Chat"}</h2>
              </div>
              <ChatRoom
                roomId={activeRoomId}
                currentUserId={userId}
                className="min-h-0 flex-1"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Pick a room to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
