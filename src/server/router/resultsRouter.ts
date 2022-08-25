import { createRouter } from './context';

export const resultsRouter = createRouter()
  .query('total', {
    resolve: async ({ ctx }) => {
      return ctx.prisma.vote.count();
    }
  })
  .query('infiniteResults', {
    resolve: async ({ ctx }) => {
      const pokemonsWithCounts = await ctx.prisma.pokemon.findMany({
        take: 898,
        include: {
          voteCount: {
            select: {
              storeCount: true,
              keepCount: true,
              releaseCount: true
            }
          }
        },
        orderBy: {
          dex_id: 'asc'
        }
      });

      return pokemonsWithCounts.map((pokemon) => ({
        id: pokemon.id,
        dexId: pokemon.dex_id,
        spriteUrl: pokemon.sprite_url,
        jpName: pokemon.jp_name,
        enName: pokemon.en_name,
        resultsInPercentage: pokemon.voteCount ? getPercentage(pokemon.voteCount) : null
      }));
    }
  });

const getPercentage = ({
  storeCount,
  keepCount,
  releaseCount
}: {
  storeCount: number;
  keepCount: number;
  releaseCount: number;
}) => {
  const total = storeCount + keepCount + releaseCount;

  return {
    store: (storeCount / total) * 100,
    keep: (keepCount / total) * 100,
    release: (releaseCount / total) * 100
  };
};
