import { ReactNode } from 'react';

import styles from './Link.module.scss';

const Link = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
      {children}
    </a>
  );
};

export default Link;
