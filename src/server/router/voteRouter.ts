import { z } from 'zod';
import { createRouter } from './context';

export const votingRouter = createRouter().mutation('commit', {
  input: z.object({
    keep: z.object({ pokemonId: z.string() }),
    release: z.object({ pokemonId: z.string() }),
    store: z.object({ pokemonId: z.string() })
  }),
  async resolve({ input, ctx }) {
    console.log('Received ', input);

    return 'todo!()';
  }
});
