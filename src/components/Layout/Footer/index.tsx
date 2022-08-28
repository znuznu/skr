import Link from '@/components/primitives/Link';
import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <div className={styles.footer}>
      <p>
        Store, Keep, Release is Copyright (c) - <strong>znu</strong> under MIT license
      </p>
      <p>
        This project uses data from the <Link href="https://pokeapi.co/">PokéAPI</Link>{' '}
        with the help of{' '}
        <Link href="https://github.com/Gabb-c/pokenode-ts">pokenode-ts</Link>.
      </p>
      <p>Pokémon and Pokémon character names are trademarks of Nintendo.</p>
    </div>
  );
};

export default Footer;
