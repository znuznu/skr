import React, { ReactElement } from 'react';
import Header from './Header';

import styles from './Layout.module.scss';

type LayoutProps = {
  children: ReactElement;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
};

export default Layout;
