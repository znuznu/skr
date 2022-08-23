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
      return [
        {
          dexId: 1,
          spriteUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png',
          jpName: 'Tempura',
          enName: 'Charizard',
          resultsInPercentage: { store: 20, keep: 30, release: 50 }
        },
        {
          dexId: 2,
          spriteUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          jpName: 'Piachinawa',
          enName: 'Pikachu',
          resultsInPercentage: { store: 8, keep: 90, release: 2 }
        },
        {
          dexId: 567,
          spriteUrl:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/320.png',
          jpName: 'Some',
          enName: 'Other one',
          resultsInPercentage: { store: 15, keep: 15, release: 70 }
        }
      ];
    }
  });
