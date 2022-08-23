import Link from 'next/link';
import React, { ReactElement } from 'react';

import styles from './Layout.module.scss';

type LayoutProps = {
  children: ReactElement;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Link href="/">
        <h1 className={styles.title}>Store, Keep, Release</h1>
      </Link>
      <ul className={styles.navbar}>
        <li>
          <Link href="/vote">Vote</Link>
        </li>
        <li>
          <Link href="/results">Results</Link>
        </li>
      </ul>
      <main>{children}</main>
    </>
  );
};

export default Layout;
