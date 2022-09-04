import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shuffle = (t: string[]) => {
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = t[i];
    t[i] = t[j];
    t[j] = temp;
  }
};

const HIGHEST_DEX_ID = 898;
const getThreeRandomDexIds = () => {
  const first = getRandomPokemonDexId();
  const second = getRandomPokemonDexId([first]);
  const third = getRandomPokemonDexId([first, second]);

  return [first, second, third];
};

const getRandomPokemonDexId: (exclude?: number[]) => number = (exclude) => {
  const pokedexNumber = Math.floor(Math.random() * HIGHEST_DEX_ID) + 1;

  if (exclude?.includes(pokedexNumber)) {
    return getRandomPokemonDexId(exclude);
  }

  return pokedexNumber;
};

const getPokemonIdsFromDexIds = async ([first, second, third]: [
  number,
  number,
  number
]): Promise<[string, string, string]> => {
  const choosenPokemon = await prisma.pokemon.findMany({
    where: { dexId: { in: [first, second, third] } }
  });

  if (choosenPokemon.length !== 3) {
    throw new Error("Couldn't find 3 Pokemon!");
  }

  return [choosenPokemon[0].id, choosenPokemon[1].id, choosenPokemon[2].id];
};

const populate = async () => {
  let limit = 10000;
  while (limit > 0) {
    if (limit % 500 === 0) {
      console.log('Step ', limit);
    }

    const [firstDexId, secondDexId, thirdDexId] = getThreeRandomDexIds();
    const pokemonIds = await getPokemonIdsFromDexIds([
      firstDexId,
      secondDexId,
      thirdDexId
    ]);

    shuffle(pokemonIds);

    const [firstId, secondId, thirdId] = pokemonIds;

    await vote({
      storePkmnId: firstId,
      keepPkmnId: secondId,
      releasePkmnId: thirdId
    });

    limit--;
  }
};

// TODO: bulk when Prisma allows it

const vote = async ({
  storePkmnId,
  keepPkmnId,
  releasePkmnId
}: {
  storePkmnId: string;
  keepPkmnId: string;
  releasePkmnId: string;
}) => {
  const storeUpsert = prisma.voteCount.upsert({
    where: {
      pokemonId: storePkmnId
    },
    update: {
      storeCount: {
        increment: 1
      }
    },
    create: {
      storeCount: 1,
      pokemonId: storePkmnId
    }
  });

  const keepUpsert = prisma.voteCount.upsert({
    where: {
      pokemonId: keepPkmnId
    },
    update: {
      keepCount: {
        increment: 1
      }
    },
    create: {
      keepCount: 1,
      pokemonId: keepPkmnId
    }
  });

  const releaseUpsert = prisma.voteCount.upsert({
    where: {
      pokemonId: releasePkmnId
    },
    update: {
      releaseCount: {
        increment: 1
      }
    },
    create: {
      releaseCount: 1,
      pokemonId: releasePkmnId
    }
  });

  await prisma.$transaction([
    prisma.vote.create({
      data: {
        storeId: storePkmnId,
        keepId: keepPkmnId,
        releaseId: releasePkmnId
      }
    }),
    storeUpsert,
    keepUpsert,
    releaseUpsert
  ]);
};

populate().then(() => {
  console.log('Done!');
});
