import { createRouter } from './context';

export const resultsRouter = createRouter().query('total', {
  resolve: async ({ ctx }) => {
    return ctx.prisma.vote.count();
  }
});
