import { Prisma } from '@prisma/client';
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
  .query('mostStored', {
    resolve: async ({ ctx }) => {
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(mostStoredQuery);

      const pokemons = await Promise.all(
        mostVoted.map(({ pokemonId }) => {
          return ctx.prisma.pokemon.findFirstOrThrow({
            where: {
              id: pokemonId
            },
            include: {
              voteCount: {
                select: {
                  storeCount: true,
                  keepCount: true,
                  releaseCount: true
                }
              }
            }
          });
        })
      );

      return pokemons.map((pokemon) => {
        const { id, dex_id, sprite_url, jp_name, en_name, voteCount } = pokemon;

        const result = {
          id: id,
          dexId: dex_id,
          spriteUrl: sprite_url,
          jpName: jp_name,
          enName: en_name
        };

        if (!voteCount) {
          return {
            ...result,
            vote: null
          };
        }

        const { storeCount, keepCount, releaseCount } = voteCount;

        const total = storeCount + keepCount + releaseCount;

        return {
          ...result,
          vote: {
            percentage: (storeCount / total) * 100,
            count: storeCount
          }
        };
      });
    }
  })
  .query('mostKeeped', {
    resolve: async ({ ctx }) => {
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(mostKeepedQuery);

      const pokemons = await Promise.all(
        mostVoted.map(({ pokemonId }) => {
          return ctx.prisma.pokemon.findFirstOrThrow({
            where: {
              id: pokemonId
            },
            include: {
              voteCount: {
                select: {
                  storeCount: true,
                  keepCount: true,
                  releaseCount: true
                }
              }
            }
          });
        })
      );

      return pokemons.map((pokemon) => {
        const { id, dex_id, sprite_url, jp_name, en_name, voteCount } = pokemon;

        const result = {
          id: id,
          dexId: dex_id,
          spriteUrl: sprite_url,
          jpName: jp_name,
          enName: en_name
        };

        if (!voteCount) {
          return {
            ...result,
            vote: null
          };
        }

        const { storeCount, keepCount, releaseCount } = voteCount;

        const total = storeCount + keepCount + releaseCount;

        return {
          ...result,
          vote: {
            percentage: (keepCount / total) * 100,
            count: keepCount
          }
        };
      });
    }
  })
  .query('mostReleased', {
    resolve: async ({ ctx }) => {
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(mostReleasedQuery);

      const pokemons = await Promise.all(
        mostVoted.map(({ pokemonId }) => {
          return ctx.prisma.pokemon.findFirstOrThrow({
            where: {
              id: pokemonId
            },
            include: {
              voteCount: {
                select: {
                  storeCount: true,
                  keepCount: true,
                  releaseCount: true
                }
              }
            }
          });
        })
      );

      return pokemons.map((pokemon) => {
        const { id, dex_id, sprite_url, jp_name, en_name, voteCount } = pokemon;

        const result = {
          id: id,
          dexId: dex_id,
          spriteUrl: sprite_url,
          jpName: jp_name,
          enName: en_name
        };

        if (!voteCount) {
          return {
            ...result,
            vote: null
          };
        }

        const { storeCount, keepCount, releaseCount } = voteCount;

        const total = storeCount + keepCount + releaseCount;

        return {
          ...result,
          vote: {
            percentage: (releaseCount / total) * 100,
            count: releaseCount
          }
        };
      });
    }
  });

type MostVotedResult = {
  pokemonId: string;
  lowerBound: number;
};

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

const LIMIT = 10;

const mostStoredQuery = Prisma.sql`SELECT "pokemonId", (("storeCount" + 1.9208) / ("storeCount" + ("releaseCount" + "keepCount")) -
                        1.96 * SQRT(("storeCount" * ("releaseCount" + "keepCount")) / ("storeCount" + ("releaseCount" + "keepCount")) + 0.9604) /
                        ("storeCount" + ("releaseCount" + "keepCount"))) / (1 + 3.8416 / ("storeCount" + ("releaseCount" + "keepCount")))
                        AS "lowerBound" FROM "VoteCount" WHERE "storeCount" + ("releaseCount" + "keepCount") > 0
                        ORDER BY "lowerBound" DESC LIMIT ${LIMIT};`;

const mostKeepedQuery = Prisma.sql`SELECT "pokemonId", (("keepCount" + 1.9208) / ("keepCount" + ("releaseCount" + "storeCount")) -
                        1.96 * SQRT(("keepCount" * ("releaseCount" + "storeCount")) / ("keepCount" + ("releaseCount" + "storeCount")) + 0.9604) /
                        ("keepCount" + ("releaseCount" + "storeCount"))) / (1 + 3.8416 / ("keepCount" + ("releaseCount" + "storeCount")))
                        AS "lowerBound" FROM "VoteCount" WHERE "keepCount" + ("releaseCount" + "storeCount") > 0
                        ORDER BY "lowerBound" DESC LIMIT ${LIMIT};`;

const mostReleasedQuery = Prisma.sql`SELECT "pokemonId", (("releaseCount" + 1.9208) / ("releaseCount" + ("storeCount" + "keepCount")) -
                        1.96 * SQRT(("releaseCount" * ("storeCount" + "keepCount")) / ("releaseCount" + ("storeCount" + "keepCount")) + 0.9604) /
                        ("releaseCount" + ("storeCount" + "keepCount"))) / (1 + 3.8416 / ("releaseCount" + ("storeCount" + "keepCount")))
                        AS "lowerBound" FROM "VoteCount" WHERE "releaseCount" + ("storeCount" + "keepCount") > 0
                        ORDER BY "lowerBound" DESC LIMIT ${LIMIT};`;
