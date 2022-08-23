import { z } from 'zod';
import { createRouter } from './context';

export const votingRouter = createRouter().mutation('commit', {
  input: z.object({
    keep: z.object({ pokemonId: z.string() }),
    release: z.object({ pokemonId: z.string() }),
    store: z.object({ pokemonId: z.string() })
  }),
  resolve: async ({ input, ctx }) => {
    const storeUpsert = ctx.prisma.voteCount.upsert({
      where: {
        pokemonId: input.store.pokemonId
      },
      update: {
        storeCount: {
          increment: 1
        }
      },
      create: {
        storeCount: 1,
        pokemonId: input.store.pokemonId
      }
    });

    const keepUpsert = ctx.prisma.voteCount.upsert({
      where: {
        pokemonId: input.keep.pokemonId
      },
      update: {
        keepCount: {
          increment: 1
        }
      },
      create: {
        keepCount: 1,
        pokemonId: input.keep.pokemonId
      }
    });

    const releaseUpsert = ctx.prisma.voteCount.upsert({
      where: {
        pokemonId: input.release.pokemonId
      },
      update: {
        releaseCount: {
          increment: 1
        }
      },
      create: {
        releaseCount: 1,
        pokemonId: input.release.pokemonId
      }
    });

    const [vote] = await ctx.prisma.$transaction([
      ctx.prisma.vote.create({
        data: {
          storeId: input.store.pokemonId,
          keepId: input.keep.pokemonId,
          releaseId: input.release.pokemonId
        }
      }),
      storeUpsert,
      keepUpsert,
      releaseUpsert
    ]);

    return vote;
  }
});
