import { createRouter } from './context';
import superjson from 'superjson';
import { pokemonRouter } from './pokemonRouter';
import { votingRouter } from './voteRouter';
import { resultsRouter } from './resultsRouter';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('pokemon.', pokemonRouter)
  .merge('vote.', votingRouter)
  .merge('results.', resultsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
