import { z } from 'zod';
import { createRouter } from './context';

export const votingRouter = createRouter().mutation('commit', {
  input: z.object({
    keep: z.number(),
    release: z.number(),
    store: z.number()
  }),
  async resolve({ input, ctx }) {
    console.log('Received ', input);

    return 'todo!()';
  }
});
