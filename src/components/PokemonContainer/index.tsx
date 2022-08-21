import Image from 'next/image';
import { useDrag } from 'react-dnd';

import { useBoxState } from '@/state/box';
import { ItemTypes } from '@/utils/dnd';
import { inferQueryOutput } from '@/utils/trpc';

import styles from './PokemonContainer.module.scss';

type TypeChipsProps = {
  type: string;
};
const TypeChips = ({ type }: TypeChipsProps) => {
  return <span className={styles.typeChips}>{type}</span>;
};

export type Pokemon = inferQueryOutput<'pokemon.getThreePokemon'>['first'];

type PokemonContainerProps = {
  pokemon: Pokemon;
};

const PokemonContainer = ({ pokemon }: PokemonContainerProps) => {
  const { contains } = useBoxState();
  const [, drag] = useDrag(
    () => ({
      type: ItemTypes.POKEMON,
      item: pokemon,
      canDrag: () => !contains(pokemon.dexId)
    }),
    [pokemon]
  );

  const isDisabled = contains(pokemon.dexId);

  return (
    <div className={isDisabled ? styles.containerDisabled : styles.container}>
      <div className={styles.heading}>
        <span className={styles.dexId}>#{pokemon.dexId}</span>
        <span className={styles.triangle}></span>
      </div>
      {pokemon.artworkUrl && (
        <div ref={drag}>
          <Image
            src={pokemon.artworkUrl}
            width={156}
            height={156}
            layout="fixed"
            quality="100"
          />
        </div>
      )}
      <div className={styles.content}>
        <h1 className={styles.name}>{pokemon.jpName ?? pokemon.enName}</h1>
        <div className={styles.types}>
          {pokemon.types.map((type) => (
            <TypeChips key={`${pokemon.id}-${type}`} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PokemonContainer;
