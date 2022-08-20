import { createRouter } from './context';
import superjson from 'superjson';
import { pokemonRouter } from './pokemonRouter';
import { votingRouter } from './voteRouter';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('pokemon.', pokemonRouter)
  .merge('vote.', votingRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
