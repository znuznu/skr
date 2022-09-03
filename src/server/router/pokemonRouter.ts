import { TRPCError } from '@trpc/server';
import { ErrorCode } from '../errors/code';
import { createRouter } from './context';

export const pokemonRouter = createRouter().query('threePokemon', {
  resolve: async ({ ctx }) => {
    const [first, second, third] = getThreeRandomDexIds();

    const choosenPokemon = await ctx.prisma.pokemon.findMany({
      where: { dexId: { in: [first, second, third] } }
    });

    if (choosenPokemon.length !== 3) {
      throw new TRPCError({
        code: ErrorCode.INTERNAL,
        message: 'Oops! Could not find 3 Pokemon...'
      });
    }

    return {
      first: choosenPokemon[0],
      second: choosenPokemon[1],
      third: choosenPokemon[2]
    };
  }
});

const HIGHEST_DEX_ID = 898;
const getThreeRandomDexIds = (): [number, number, number] => {
  const availableIds = [...Array.from({ length: HIGHEST_DEX_ID }, (_, i) => i + 1)];

  const firstIndex = Math.floor(Math.random() * availableIds.length);
  const firstId = availableIds.splice(firstIndex, 1)[0];

  const secondIndex = Math.floor(Math.random() * availableIds.length);
  const secondId = availableIds.splice(secondIndex, 1)[0];

  const thirdIndex = Math.floor(Math.random() * availableIds.length);
  const thirdId = availableIds.splice(thirdIndex, 1)[0];

  return [firstId, secondId, thirdId];
};
