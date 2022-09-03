import fs from 'fs';
import { Pokemon, PrismaClient } from '@prisma/client';

import { PokemonClient as PokenodeClient, Pokemon as PokeApiPokemon } from 'pokenode-ts';

const prisma = new PrismaClient();

const CSV_FILE = 'pokemon.csv';

const mapPokemonToCsv = (
  pokeApiPokemon: PokeApiPokemon,
  japaneseName?: string
): string => {
  const pokemonMapped = {
    dexId: pokeApiPokemon.id,
    types: pokeApiPokemon.types.map((t) => t.type.name),
    enName: pokeApiPokemon.name,
    jpName: japaneseName,
    spriteUrl: pokeApiPokemon.sprites.front_default,
    artworkUrl: pokeApiPokemon.sprites.other['official-artwork'].front_default
  };

  return Object.values(pokemonMapped).join(';') + '\n';
};

const createCsv = async () => {
  const pokenodeClient = new PokenodeClient();

  const namedResources = await pokenodeClient.listPokemons(0, 898);

  const names = namedResources.results.map((resource) => resource.name);

  for (const name of names) {
    const pokemon = await pokenodeClient.getPokemonByName(name);

    const species = await pokenodeClient.getPokemonSpeciesById(pokemon.id);
    const japaneseName = species.names.find(
      (speciesName) => speciesName.language.name === 'ja-Hrkt'
    )?.name;

    fs.appendFile(CSV_FILE, mapPokemonToCsv(pokemon, japaneseName), (err) => {
      if (err) {
        throw err;
      }
    });
  }
};

const seed = async () => {
  if (!fs.existsSync('pokemon.csv')) {
    await createCsv();
  }

  fs.readFile(CSV_FILE, 'utf8', async (err, data) => {
    if (err) {
      throw err;
    }

    const lines = data.split('\n');
    const pokemonlist = lines.reduce<Omit<Pokemon, 'id'>[]>((acc, curr) => {
      if (curr === '') {
        return acc;
      }

      const parts = curr.split(';');

      return [
        ...acc,
        {
          dexId: Number.parseInt(parts[0]),
          types: parts[1].split(','),
          enName: parts[2],
          jpName: parts[3],
          spriteUrl: parts[4],
          artworkUrl: parts[5]
        }
      ];
    }, []);

    await prisma.pokemon.createMany({
      data: pokemonlist
    });
  });
};

seed();
