import DropZone from '@/components/DropZone';
import PokemonContainer from '@/components/PokemonContainer';
import Button from '@/components/primitives/Button';
import { useBoxState } from '@/state/box';
import type { NextPage } from 'next';
import React from 'react';
import { trpc } from 'src/utils/trpc';

import styles from './Vote.module.scss';

const Vote: NextPage = () => {
  const { boxes, emptyAll, isFull } = useBoxState();
  const { data, refetch } = trpc.useQuery(['pokemon.threePokemon']);
  const { mutate } = trpc.useMutation(['vote.commit'], {
    onMutate: () => {
      emptyAll();
    },
    onSuccess: () => {
      refetch();
    }
  });

  return (
    <div className={styles.vote}>
      <p className={styles.help}>
        To play, simply drag and drop the Pokemon in the boxes of your choice (you can
        switch them too) and press the VOTE button.
      </p>
      {data ? (
        <div className={styles.choices}>
          <PokemonContainer pokemon={data.first} />
          <PokemonContainer pokemon={data.second} />
          <PokemonContainer pokemon={data.third} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
      <DropZone />
      <Button
        onClick={() => {
          if (boxes.keep && boxes.release && boxes.store) {
            mutate({
              store: { pokemonId: boxes.store.id },
              release: { pokemonId: boxes.release.id },
              keep: { pokemonId: boxes.keep.id }
            });
          }
        }}
        disabled={!isFull()}
        ariaLabel={'Click to vote'}
      >
        Vote
      </Button>
    </div>
  );
};

export default Vote;
