import Link from 'next/link';
import React from 'react';
import { GitHubLogoIcon } from '@radix-ui/react-icons';

import styles from './Header.module.scss';

export const Header = () => {
  return (
    <div className={styles.header}>
      <Link href="/">
        <h1 className={styles.title}>SKR</h1>
      </Link>
      <ul className={styles.navbar}>
        <li>
          <Link href="/vote">Vote</Link>
        </li>
        <li>
          <Link href="/results">Results</Link>
        </li>
      </ul>
      <a href="https://github.com/znuznu/skr" target="_blank" rel="noopener noreferrer">
        <GitHubLogoIcon width={'24px'} height={'24px'} />
      </a>
    </div>
  );
};

export default Header;
