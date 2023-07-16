import { publicDecrypt } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

const flowSchema = z.object({
  name: z.string(),
  userId: z.string(),
  baseAmount: z.number(),
});

const id = z.object({
  flowId: z.number(),
});

const userId = z.object({
  userId: z.string(),
});

export const flowRouter = createTRPCRouter({
  createFlow: protectedProcedure
    .input(flowSchema)
    .mutation(({ input, ctx }) => {
      return ctx.prisma.flow.create({ data: flowSchema.parse(input) });
    }),

  deleteFlow: protectedProcedure.input(id).mutation(({ input, ctx }) => {
    return ctx.prisma.flow.delete({
      where: {
        id: id.parse(input).flowId,
      },
    });
  }),

  getAllFlows: protectedProcedure.input(userId).query(({ ctx, input }) => {
    return ctx.prisma.flow.findMany({
      where: {
        userId: input.userId,
      },
    });
  }),
});
