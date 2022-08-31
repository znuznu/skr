import Image from 'next/image';

import { inferQueryOutput } from '@/utils/trpc';

import styles from './MostVoted.module.scss';
import resultsStyles from '@/pages/Results.module.scss';

import * as Table from '@/components/primitives/Table';

export type MostVotedProps = inferQueryOutput<'results.mostStored'>;

const MostVoted = ({ title, pokemons }: { title: string; pokemons: MostVotedProps }) => {
  return (
    <div className={styles.mostVoted}>
      <h2>{title}</h2>
      <Table.Root>
        <Table.TableHead>
          <Table.Row>
            <Table.Head>id</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>% and counts</Table.Head>
          </Table.Row>
        </Table.TableHead>
        <Table.Body>
          {pokemons.map((result) => (
            <Table.Row key={result.dexId}>
              <Table.Data>
                <span className={resultsStyles.dexId}>#{result.dexId}</span>
              </Table.Data>
              <Table.Data className={resultsStyles.tdPokemon}>
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
                <div className={resultsStyles.tdNames}>
                  <span>{result.enName}</span>
                  <span className={resultsStyles.jpName}>{result.jpName}</span>
                </div>
              </Table.Data>
              <Table.Data>
                {/* FIXME Shouldn't be nullable */}
                <strong>{result.vote!.percentage.toFixed(1)}%</strong> with{' '}
                <strong>{result.vote!.count}</strong> votes
              </Table.Data>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default MostVoted;
