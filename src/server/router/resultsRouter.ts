import { z } from 'zod';
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
        vote: pokemon.voteCount ? getVoteDetails(pokemon.voteCount) : null
      }));
    }
  })
  .query('mostVoted', {
    input: z.object({ type: z.enum(['store', 'keep', 'release']) }),
    resolve: async () => {
      return [
        {
          id: '123',
          dexId: '25',
          spriteUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          jpName: 'Pika-shu',
          enName: 'Pikachu',
          vote: {
            percentage: 78,
            count: 42
          }
        }
      ];
    }
  });

const getVoteDetails = ({
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
    store: { percentage: (storeCount / total) * 100, count: storeCount },
    keep: { percentage: (keepCount / total) * 100, count: keepCount },
    release: { percentage: (releaseCount / total) * 100, count: releaseCount }
  };
};
