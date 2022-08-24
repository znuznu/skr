import type { NextPage } from 'next';
import Image from 'next/image';
import React from 'react';
import { trpc } from 'src/utils/trpc';

import styles from './Results.module.scss';

const Results: NextPage = () => {
  const { data } = trpc.useQuery(['results.infiniteResults']);

  return (
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
        {data &&
          data.map((result) => (
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
  );
};

export default Results;
