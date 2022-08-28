import { appRouter } from '@/server/router';
import { createContext } from '@/server/router/context';
import { createSSGHelpers } from '@trpc/react/ssg';
import type { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';

import styles from './Results.module.scss';

type ResultsPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const Results = ({ results, total }: ResultsPageProps) => {
  return (
    <>
      <p className={styles.information}>Results are updated every hour.</p>
      <p>Total votes: {total} </p>
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
            <tr
              key={result.dexId}
              title={
                result.vote
                  ? `Store: ${result.vote.store.count} | Keep: ${result.vote.keep.count} | Release: ${result.vote.release.count}`
                  : `Store: 0 | Keep: 0 | Release: 0`
              }
            >
              <td>
                <span className={styles.dexId}>#{result.dexId}</span>
              </td>
              <td className={styles.tdPokemon}>
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
                <div className={styles.tdNames}>
                  <span>{result.enName}</span>
                  <span className={styles.jpName}>{result.jpName}</span>
                </div>
              </td>
              {result.vote ? (
                <>
                  <td>{result.vote.store.percentage.toFixed(1)}%</td>
                  <td>{result.vote.keep.percentage.toFixed(1)}%</td>
                  <td>{result.vote.release.percentage.toFixed(1)}%</td>
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
      results: await ssg.fetchQuery('results.infiniteResults'),
      total: await ssg.fetchQuery('results.total')
    },
    revalidate: REVALIDATE_TIME_IN_SECONDS
  };
};
