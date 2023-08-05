import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

const flowSchema = z.object({
    name: z.string(),
    userId: z.string(),
    interval: z.number(),
    dollarAmount: z.number(),
    percentAmount: z.number(),
});

const connectionSchema = z.object({
    dollarAmount: z.number(),
    percentAmount: z.number(),
    inputFlowId: z.number(),
    outputFlowId: z.optional(z.number()),
});

const connectedFlowSchema = z.object({
    name: z.string(),
    userId: z.string(),
    interval: z.number(),
    dollarAmount: z.number(),
    percentAmount: z.number(),
    inputConnections: z.array(connectionSchema),
});

const id = z.object({
    flowId: z.number(),
});

const userId = z.object({
    userId: z.string(),
});

export const flowRouter = createTRPCRouter({
    createFlow: protectedProcedure.input(flowSchema).mutation(({ input, ctx }) => {
        return ctx.prisma.flow.create({ data: flowSchema.parse(input) });
    }),

    // TODO: new flows CANNOT make the new graph cyclic
    createConnectedFlow: protectedProcedure.input(connectedFlowSchema).mutation(({ input, ctx }) => {
        const newFlow = connectedFlowSchema.parse(input);

        return ctx.prisma.flow.create({
            data: {
                name: newFlow.name,
                userId: newFlow.userId,
                interval: newFlow.interval,
                dollarAmount: newFlow.dollarAmount,
                percentAmount: newFlow.percentAmount,
                inputConnections: {
                    create: newFlow.inputConnections.map((conn) => ({
                        dollarAmount: conn.dollarAmount,
                        percentAmount: conn.percentAmount,
                        inputFlowId: conn.inputFlowId,
                    })),
                },
            },
            include: {
                inputConnections: true,
                outputConnections: true,
            },
        });
    }),

    /*finishFlowConnection: protectedProcedure.input(flowSchema).mutation(({ input, ctx }) => {
        const flow = connectedFlowSchema.parse(input);

        return ctx.prisma.connection.update({
            where: {
                id: flow.inputConnections.reduce((x, y) => x.id > y.id ? x : y).id
            },
            data: {
                
            }
        })
    }),*/

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
            include: {
                inputConnections: true,
                outputConnections: true,
            },
        });
    }),
});
