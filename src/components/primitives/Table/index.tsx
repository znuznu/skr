import { ReactNode } from 'react';

import styles from './Table.module.scss';

export const TableHead = ({ children }: { children: ReactNode }) => {
  return <thead>{children}</thead>;
};

export const Row = ({ children, title }: { children: ReactNode; title?: string }) => {
  return <tr title={title}>{children}</tr>;
};

export const Head = ({ children }: { children: ReactNode }) => {
  return <th>{children}</th>;
};

export const Data = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <td className={className}>{children}</td>;
};

export const Body = ({ children }: { children: ReactNode }) => {
  return <tbody>{children}</tbody>;
};

export const Root = ({ children }: { children: ReactNode }) => {
  return <table className={styles.table}>{children}</table>;
};
