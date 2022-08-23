import { z } from 'zod';
import { createRouter } from './context';

export const votingRouter = createRouter()
  .mutation('commit', {
    input: z.object({
      keep: z.object({ pokemonId: z.string() }),
      release: z.object({ pokemonId: z.string() }),
      store: z.object({ pokemonId: z.string() })
    }),
    resolve: async ({ input, ctx }) => {
      const vote = await ctx.prisma.vote.create({
        data: {
          storeId: input.store.pokemonId,
          keepId: input.keep.pokemonId,
          releaseId: input.release.pokemonId
        }
      });

      return vote;
    }
  })
  .query('getTotal', {
    resolve: async ({ ctx }) => {
      return ctx.prisma.vote.count();
    }
  });
