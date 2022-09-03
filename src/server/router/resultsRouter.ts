import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { ErrorCode } from '../errors/code';
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
          dexId: 'asc'
        }
      });

      return pokemonsWithCounts.map((pokemon) => ({
        id: pokemon.id,
        dexId: pokemon.dexId,
        spriteUrl: pokemon.spriteUrl,
        jpName: pokemon.jpName,
        enName: pokemon.enName,
        vote: pokemon.voteCount ? getVotePercentages(pokemon.voteCount) : null
      }));
    }
  })
  .query('mostVoted', {
    input: z.object({
      kind: z.enum(['store', 'keep', 'release'])
    }),
    resolve: async ({ ctx, input }) => {
      const { kind } = input;
      const query = getMostVotedQuery[kind];
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(query);
      const ids = mostVoted.map(({ pokemonId }) => pokemonId);

      if (!ids.length) {
        return [];
      }

      const pokemons = await ctx.prisma.$queryRaw<PercentageResult[]>(
        getResultRecord[kind](ids)
      );

      return pokemons.map(mapPercentageResult);
    }
  });

type PercentageResult = {
  id: string;
  enName: string;
  dexId: number;
  spriteUrl: string;
  jpName?: string;
  count: number;
  percentage: number;
};

type MostVotedResult = {
  pokemonId: string;
  lowerBound: number;
};

const getVotePercentages = ({
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

type ResultKind = 'store' | 'keep' | 'release';
const getMostVotedQuery: Record<ResultKind, Prisma.Sql> = {
  store: mostStoredQuery,
  keep: mostKeepedQuery,
  release: mostReleasedQuery
};

const getStoreResult = (pokemonIds: string[]) => {
  return Prisma.sql`
          SELECT p."id", "enName", "dexId", "spriteUrl", "jpName", 
          "storeCount" as Count,
          ("storeCount" * 100 / ("storeCount" + "keepCount" + "releaseCount")) as Percentage
          FROM "Pokemon" p
          JOIN "VoteCount" vc
          ON p."id" = vc."pokemonId"
          JOIN unnest(array[${Prisma.join(
            pokemonIds
          )}]) with ordinality as l(pokemonId, idx) ON vc."pokemonId" = l.pokemonId
          ORDER BY l.idx`;
};

const getKeepResult = (pokemonIds: string[]) => {
  return Prisma.sql`
          SELECT p."id", "enName", "dexId", "spriteUrl", "jpName", 
          "keepCount" as Count,
          ("keepCount" * 100 / ("storeCount" + "keepCount" + "releaseCount")) as Percentage
          FROM "Pokemon" p
          JOIN "VoteCount" vc
          ON p."id" = vc."pokemonId"
          JOIN unnest(array[${Prisma.join(
            pokemonIds
          )}]) with ordinality as l(pokemonId, idx) ON vc."pokemonId" = l.pokemonId
          ORDER BY l.idx`;
};

const getReleaseResult = (pokemonIds: string[]) => {
  return Prisma.sql`
          SELECT p."id", "enName", "dexId", "spriteUrl", "jpName", 
          "releaseCount" as Count,
          ("releaseCount" * 100 / ("storeCount" + "keepCount" + "releaseCount")) as Percentage
          FROM "Pokemon" p
          JOIN "VoteCount" vc
          ON p."id" = vc."pokemonId"
          JOIN unnest(array[${Prisma.join(
            pokemonIds
          )}]) with ordinality as l(pokemonId, idx) ON vc."pokemonId" = l.pokemonId
          ORDER BY l.idx`;
};

const getResultRecord: Record<ResultKind, (pokemonIds: string[]) => Prisma.Sql> = {
  store: getStoreResult,
  keep: getKeepResult,
  release: getReleaseResult
};

const mapPercentageResult = ({
  id,
  dexId,
  spriteUrl,
  jpName,
  enName,
  count,
  percentage
}: PercentageResult) => {
  return {
    pokemon: {
      id,
      dexId,
      spriteUrl,
      jpName,
      enName
    },
    vote: {
      percentage: Number(percentage),
      count
    }
  };
};
