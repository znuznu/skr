import type { NextPage } from 'next';
import React from 'react';

import styles from './Index.module.scss';

const Home: NextPage = () => {
  return (
    <div className={styles.home}>
      <p>
        This website is based on the popular <em>Kiss, Marry, Kill game</em>, but you must
        choose between keeping a Pokemon in your team, storing one in your PC and
        releasing one into the wild.
      </p>
    </div>
  );
};

export default Home;
