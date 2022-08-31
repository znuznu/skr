import { Pokemon as PrismaPokemon } from '.prisma/client';
import { TRPCError } from '@trpc/server';
import { ErrorCode } from '../errors/code';
import { createRouter } from './context';

export const pokemonRouter = createRouter().query('threePokemon', {
  resolve: async ({ ctx }) => {
    const [first, second, third] = getThreeRandomDexIds();

    const choosenPokemon = await ctx.prisma.pokemon.findMany({
      where: { dex_id: { in: [first, second, third] } }
    });

    if (choosenPokemon.length !== 3) {
      throw new TRPCError({
        code: ErrorCode.INTERNAL,
        message: 'Oops! Could not find 3 Pokemon...'
      });
    }

    return {
      first: mapPokemon(choosenPokemon[0]),
      second: mapPokemon(choosenPokemon[1]),
      third: mapPokemon(choosenPokemon[2])
    };
  }
});

const mapPokemon = (prismaPokemon: PrismaPokemon) => {
  return {
    id: prismaPokemon.id,
    dexId: prismaPokemon.dex_id,
    types: prismaPokemon.types,
    enName: prismaPokemon.en_name,
    jpName: prismaPokemon.jp_name,
    artworkUrl: prismaPokemon.artwork_url,
    spriteUrl: prismaPokemon.sprite_url
  };
};

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
