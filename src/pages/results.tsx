import { appRouter } from '@/server/router';
import { createContext } from '@/server/router/context';
import { createSSGHelpers } from '@trpc/react/ssg';
import type { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';

import styles from './Results.module.scss';

type ResultsPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const Results = ({ results }: ResultsPageProps) => {
  return (
    <>
      <p className={styles.information}>Results are updated every hour.</p>
      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th>id</th>
            <th>Name</th>
            <th>Store</th>
            <th>Keep</th>
            <th>Release</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.dexId}>
              <td>
                <span className={styles.dexId}>#{result.dexId}</span>
              </td>
              <td className={styles.tdName}>
                {result.spriteUrl && (
                  <div>
                    <Image
                      src={result.spriteUrl}
                      width={96}
                      height={96}
                      layout="fixed"
                      quality="100"
                    />
                  </div>
                )}
                {result.jpName ? result.jpName : result.enName}
              </td>
              {result.resultsInPercentage ? (
                <>
                  <td>{result.resultsInPercentage.store.toFixed(1)}%</td>
                  <td>{result.resultsInPercentage.keep.toFixed(1)}%</td>
                  <td>{result.resultsInPercentage.release.toFixed(1)}%</td>
                </>
              ) : (
                <>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Results;

const REVALIDATE_TIME_IN_SECONDS = 60 * 60;

export const getStaticProps = async () => {
  const ssg = createSSGHelpers({
    router: appRouter,
    ctx: createContext()
  });

  return {
    props: {
      results: await ssg.fetchQuery('results.infiniteResults')
    },
    revalidate: REVALIDATE_TIME_IN_SECONDS
  };
};
