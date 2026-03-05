import { z } from "zod/v4";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";

export const chatRouter = createTRPCRouter({
  /**
   * List rooms the current user is a member of, with last message preview.
   */
  listRooms: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db.chatMember.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        room: {
          include: {
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
              include: { user: { select: { name: true } } },
            },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { room: { updatedAt: "desc" } },
    });

    return memberships.map((m) => {
      const lastMessage = m.room.messages[0] ?? null;
      return {
        id: m.room.id,
        name: m.room.name,
        memberCount: m.room._count.members,
        lastMessage: lastMessage
          ? {
              content: lastMessage.content,
              senderName: lastMessage.user.name ?? "Unknown",
              createdAt: lastMessage.createdAt,
            }
          : null,
        lastSeen: m.lastSeen,
      };
    });
  }),

  /**
   * Get messages for a room. Supports cursor-based pagination for loading
   * older messages and an `after` parameter for polling new ones.
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        cursor: z.string().optional(),
        after: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify membership
      const member = await ctx.db.chatMember.findUnique({
        where: {
          userId_roomId: { userId: ctx.session.user.id, roomId: input.roomId },
        },
      });
      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this room" });
      }

      const messages = await ctx.db.chatMessage.findMany({
        where: {
          roomId: input.roomId,
          ...(input.after && {
            createdAt: { gt: (await ctx.db.chatMessage.findUnique({ where: { id: input.after } }))?.createdAt ?? new Date() },
          }),
          ...(input.cursor && {
            createdAt: { lt: (await ctx.db.chatMessage.findUnique({ where: { id: input.cursor } }))?.createdAt ?? new Date() },
          }),
        },
        orderBy: { createdAt: input.after ? "asc" : "desc" },
        take: input.limit,
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      // Reverse if loading older messages (cursor-based) so they're chronological
      const sorted = input.after ? messages : messages.reverse();

      return {
        messages: sorted,
        nextCursor: !input.after && messages.length === input.limit ? messages[0]?.id : undefined,
      };
    }),

  /**
   * Send a message to a room.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify membership
      const member = await ctx.db.chatMember.findUnique({
        where: {
          userId_roomId: { userId: ctx.session.user.id, roomId: input.roomId },
        },
      });
      if (!member) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Not a member of this room" });
      }

      const message = await ctx.db.chatMessage.create({
        data: {
          content: input.content,
          userId: ctx.session.user.id,
          roomId: input.roomId,
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      // Touch room updatedAt for ordering
      await ctx.db.chatRoom.update({
        where: { id: input.roomId },
        data: { updatedAt: new Date() },
      });

      return message;
    }),

  /**
   * Create a new chat room and add the creator as a member.
   */
  createRoom: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const room = await ctx.db.chatRoom.create({
        data: {
          name: input.name,
          members: {
            create: { userId: ctx.session.user.id },
          },
        },
      });
      return room;
    }),

  /**
   * Join a room.
   */
  joinRoom: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.chatMember.findUnique({
        where: {
          userId_roomId: { userId: ctx.session.user.id, roomId: input.roomId },
        },
      });
      if (existing) return existing;

      return ctx.db.chatMember.create({
        data: { userId: ctx.session.user.id, roomId: input.roomId },
      });
    }),

  /**
   * List all rooms (for room discovery / joining).
   */
  discoverRooms: protectedProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.db.chatRoom.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        _count: { select: { members: true, messages: true } },
        members: {
          where: { userId: ctx.session.user.id },
          select: { userId: true },
        },
      },
    });

    return rooms.map((room) => ({
      id: room.id,
      name: room.name,
      memberCount: room._count.members,
      messageCount: room._count.messages,
      isMember: room.members.length > 0,
      createdAt: room.createdAt,
    }));
  }),

  /**
   * Update the user's lastSeen timestamp for presence tracking.
   */
  markSeen: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.chatMember.update({
        where: {
          userId_roomId: { userId: ctx.session.user.id, roomId: input.roomId },
        },
        data: { lastSeen: new Date() },
      });
    }),

  /**
   * Get online members of a room (seen in last 30 seconds).
   */
  getOnlineMembers: protectedProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const thirtySecondsAgo = new Date(Date.now() - 30_000);

      const members = await ctx.db.chatMember.findMany({
        where: {
          roomId: input.roomId,
          lastSeen: { gte: thirtySecondsAgo },
        },
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      });

      return members.map((m) => m.user);
    }),
});
