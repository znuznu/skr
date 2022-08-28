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

export type Pokemon = inferQueryOutput<'pokemon.threePokemon'>['first'];

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
      <span className={styles.dexId}>
        <em>#{pokemon.dexId}</em>
      </span>
      {pokemon.jpName && <h1 className={styles.jpName}>{pokemon.jpName}</h1>}
      {pokemon.artworkUrl && (
        <div className={styles.artwork} ref={drag}>
          <Image
            src={pokemon.artworkUrl}
            width={156}
            height={156}
            layout="fixed"
            quality="100"
          />
        </div>
      )}
      <h1 className={styles.enName}>{pokemon.enName}</h1>
      <div className={styles.types}>
        {pokemon.types.map((type) => (
          <TypeChips key={`${pokemon.id}-${type}`} type={type} />
        ))}
      </div>
    </div>
  );
};

export default PokemonContainer;
