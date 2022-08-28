import { trpc } from '@/utils/trpc';
import type { NextPage } from 'next';
import React from 'react';

import styles from './Index.module.scss';

const Home: NextPage = () => {
  const { data: totalCount } = trpc.useQuery(['results.total']);

  return (
    <div className={styles.home}>
      <h1>Store, Keep, Release</h1>
      <p className={styles.explanation}>
        This website is based on the popular <em>Kiss, Marry, Kill game</em>, but you must
        choose between keeping a Pokemon in your team, storing one in your PC and
        releasing one into the wild.
      </p>
      <h2>Hall of fame</h2>
      <p>Total votes: {totalCount} </p>
    </div>
  );
};

export default Home;
