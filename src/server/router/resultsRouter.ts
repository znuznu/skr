import { VoteCount } from '.prisma/client';
import { createRouter } from './context';

export const resultsRouter = createRouter()
  .query('total', {
    resolve: async ({ ctx }) => {
      return ctx.prisma.vote.count();
    }
  })
  .query('infiniteResults', {
    resolve: async ({ ctx }) => {
      const pokemonsAndVoteCounts = await ctx.prisma.pokemon.findMany({
        take: 15,
        include: {
          voteCount: true
        },
        orderBy: {
          dex_id: 'asc'
        }
      });

      return pokemonsAndVoteCounts.map((pokemon) => ({
        dexId: pokemon.dex_id,
        spriteUrl: pokemon.sprite_url,
        jpName: pokemon.jp_name,
        enName: pokemon.en_name,
        resultsInPercentage: pokemon.voteCount ? getPercentage(pokemon.voteCount) : null
      }));
    }
  });

const getPercentage = (voteCount: VoteCount) => {
  const { storeCount, keepCount, releaseCount } = voteCount;

  const total = storeCount + keepCount + releaseCount;

  return {
    store: (storeCount / total) * 100,
    keep: (keepCount / total) * 100,
    release: (releaseCount / total) * 100
  };
};
