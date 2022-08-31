import { appRouter } from '@/server/router';
import { createContext } from '@/server/router/context';
import { createSSGHelpers } from '@trpc/react/ssg';
import type { InferGetStaticPropsType } from 'next';
import Image from 'next/image';
import React from 'react';

import * as Table from '@/components/primitives/Table';

import styles from './Results.module.scss';

type ResultsPageProps = InferGetStaticPropsType<typeof getStaticProps>;

const Results = ({ results, total }: ResultsPageProps) => {
  return (
    <div className={styles.results}>
      <p className={styles.information}>Results are updated every hour.</p>
      <p>Total votes: {total} </p>
      <Table.Root>
        <Table.TableHead>
          <Table.Row>
            <Table.Head>id</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Store</Table.Head>
            <Table.Head>Keep</Table.Head>
            <Table.Head>Release</Table.Head>
          </Table.Row>
        </Table.TableHead>
        <Table.Body>
          {results.map((result) => (
            <Table.Row
              key={result.dexId}
              title={
                result.vote
                  ? `Store: ${result.vote.store.count} | Keep: ${result.vote.keep.count} | Release: ${result.vote.release.count}`
                  : `Store: 0 | Keep: 0 | Release: 0`
              }
            >
              <Table.Data>
                <span className={styles.dexId}>#{result.dexId}</span>
              </Table.Data>
              <Table.Data className={styles.tdPokemon}>
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
              </Table.Data>
              {result.vote ? (
                <>
                  <Table.Data>{result.vote.store.percentage.toFixed(1)}%</Table.Data>
                  <Table.Data>{result.vote.keep.percentage.toFixed(1)}%</Table.Data>
                  <Table.Data>{result.vote.release.percentage.toFixed(1)}%</Table.Data>
                </>
              ) : (
                <>
                  <Table.Data>-</Table.Data>
                  <Table.Data>-</Table.Data>
                  <Table.Data>-</Table.Data>
                </>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
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
