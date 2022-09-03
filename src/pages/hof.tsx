import { appRouter } from '@/server/router';
import { createSSGHelpers } from '@trpc/react/ssg';
import { createContext } from '@/server/router/context';
import type { InferGetStaticPropsType } from 'next';
import React from 'react';

import styles from './Hof.module.scss';
import MostVoted from '@/components/MostVoted';

type HallOfFamePageProps = InferGetStaticPropsType<typeof getStaticProps>;

const HallOfFame = ({ results }: HallOfFamePageProps) => {
  return (
    <div className={styles.hallOfFame}>
      <h1>Hall of Fame</h1>
      <MostVoted title="Most stored" pokemons={results.store} />
      <MostVoted title="Most keeped" pokemons={results.keep} />
      <MostVoted title="Most released" pokemons={results.release} />
    </div>
  );
};

export default HallOfFame;

const REVALIDATE_TIME_IN_SECONDS = 60 * 60;

export const getStaticProps = async () => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: createContext()
  });

  return {
    props: {
      results: {
        store: await ssg.fetchQuery('results.mostVoted', { kind: 'store' }),
        keep: await ssg.fetchQuery('results.mostVoted', { kind: 'keep' }),
        release: await ssg.fetchQuery('results.mostVoted', { kind: 'release' })
      }
    },
    revalidate: REVALIDATE_TIME_IN_SECONDS
  };
};
