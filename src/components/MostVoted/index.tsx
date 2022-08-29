import { inferQueryOutput } from '@/utils/trpc';
import Image from 'next/image';

import styles from './MostVoted.module.scss';

import * as Table from '@/components/primitives/Table';

export type MostVotedProps = inferQueryOutput<'results.mostVoted'>;

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
              <Table.Data>
                <strong>{result.vote.percentage.toFixed(1)}%</strong> with{' '}
                <strong>{result.vote.count}</strong> votes
              </Table.Data>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default MostVoted;
