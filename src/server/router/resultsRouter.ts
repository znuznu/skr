import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
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
          dex_id: 'asc'
        }
      });

      return pokemonsWithCounts.map((pokemon) => ({
        id: pokemon.id,
        dexId: pokemon.dex_id,
        spriteUrl: pokemon.sprite_url,
        jpName: pokemon.jp_name,
        enName: pokemon.en_name,
        vote: pokemon.voteCount ? getVotePercentages(pokemon.voteCount) : null
      }));
    }
  })
  .query('mostStored', {
    resolve: async ({ ctx }) => {
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(mostStoredQuery);

      const ids = mostVoted.map(({ pokemonId }) => pokemonId);
      const pokemons = await ctx.prisma.$queryRaw<PercentageResult[]>(
        getStoreResult(ids)
      );

      return pokemons.map(mapPercentageResult);
    }
  })
  .query('mostKeeped', {
    resolve: async ({ ctx }) => {
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(mostKeepedQuery);

      const ids = mostVoted.map(({ pokemonId }) => pokemonId);
      const pokemons = await ctx.prisma.$queryRaw<PercentageResult[]>(getKeepResult(ids));

      return pokemons.map(mapPercentageResult);
    }
  })
  .query('mostReleased', {
    resolve: async ({ ctx }) => {
      const mostVoted = await ctx.prisma.$queryRaw<MostVotedResult[]>(mostReleasedQuery);

      const ids = mostVoted.map(({ pokemonId }) => pokemonId);
      const pokemons = await ctx.prisma.$queryRaw<PercentageResult[]>(
        getReleaseResult(ids)
      );

      return pokemons.map(mapPercentageResult);
    }
  });

type PercentageResult = {
  id: string;
  en_name: string;
  dex_id: number;
  sprite_url: string;
  jp_name?: string;
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

const getStoreResult = (pokemonIds: string[]) => {
  return Prisma.sql`
          SELECT p."id", "en_name", "dex_id", "sprite_url", "jp_name", 
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
          SELECT p."id", "en_name", "dex_id", "sprite_url", "jp_name", 
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
          SELECT p."id", "en_name", "dex_id", "sprite_url", "jp_name", 
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

const mapPercentageResult = ({
  id,
  dex_id,
  sprite_url,
  jp_name,
  en_name,
  count,
  percentage
}: PercentageResult) => {
  if (!count) {
    throw new TRPCError({
      code: ErrorCode.INTERNAL,
      message: 'Count is missing in a percentage result.'
    });
  }

  return {
    pokemon: {
      id,
      dexId: dex_id,
      spriteUrl: sprite_url,
      jpName: jp_name,
      enName: en_name
    },
    vote: {
      percentage: Number(percentage),
      count
    }
  };
};
