import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useDrag, useDrop } from 'react-dnd';
import { inferQueryOutput, trpc } from 'src/utils/trpc';
import create from 'zustand';

import styles from './Index.module.scss';

type Box = {
  store: Pokemon | undefined;
  keep: Pokemon | undefined;
  release: Pokemon | undefined;
};
type BoxType = keyof Box;

interface BoxState {
  boxes: {
    store: Pokemon | undefined;
    keep: Pokemon | undefined;
    release: Pokemon | undefined;
  };
  add: (type: BoxType, pokemon: Pokemon) => void;
  delete: (type: BoxType) => void;
  switchBox: (a: BoxType, b: BoxType) => void;
  emptyAll: () => void;
  contains: (dexId: number) => boolean;
}

const emptyBoxes = { store: undefined, keep: undefined, release: undefined };

const useBoxState = create<BoxState>()((set, get) => ({
  boxes: emptyBoxes,
  add: (type, pokemon) =>
    set((state) => ({ boxes: { ...state.boxes, [type]: pokemon } })),
  delete: (type) => set((state) => ({ boxes: { ...state.boxes, [type]: undefined } })),
  switchBox: (typeA, typeB) =>
    set((state) => ({
      boxes: { ...state.boxes, [typeA]: state.boxes[typeB], [typeB]: state.boxes[typeA] }
    })),
  emptyAll: () => set({ boxes: emptyBoxes }),
  contains: (dexId) => {
    return (
      get().boxes.store?.dexId === dexId ||
      get().boxes.keep?.dexId === dexId ||
      get().boxes.release?.dexId === dexId
    );
  }
}));

const ItemTypes = {
  POKEMON: 'pokemon',
  BOX_TYPE: 'pokemonInBox'
};

type TypeChipsProps = {
  type: string;
};
const TypeChips = ({ type }: TypeChipsProps) => {
  return <span className={styles.typeChips}>{type}</span>;
};

type Pokemon = inferQueryOutput<'pokemon.getThreePokemon'>['first'];

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

type TypeWrapper = { type: BoxType };
const isTypeWrapper = (o: unknown): o is TypeWrapper => {
  return typeof o === 'object' && o !== null && 'type' in o;
};

type DropBoxProps = {
  label: string;
  type: BoxType;
};
const DropBox = ({ label, type }: DropBoxProps) => {
  const { add, boxes, switchBox } = useBoxState();

  const [, drop] = useDrop(
    () => ({
      accept: [ItemTypes.POKEMON, ItemTypes.BOX_TYPE],
      drop: (item: Pokemon | TypeWrapper) => {
        if (isTypeWrapper(item)) {
          switchBox(type, item.type);
        } else {
          add(type, item);
        }
      }
    }),
    []
  );

  const [, drag] = useDrag(
    () => ({
      type: ItemTypes.BOX_TYPE,
      item: { type },
      canDrag: () => boxes[type] !== undefined
    }),
    [boxes[type]]
  );

  return (
    <div>
      <span>{label}</span>
      <div className={styles.dropBox} ref={drop}>
        {boxes[type]?.artworkUrl && (
          <div ref={drag}>
            <Image
              // @ts-ignore
              src={boxes[type].artworkUrl}
              width={156}
              height={156}
              layout="fixed"
              quality="100"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const DropZone = () => {
  return (
    <div className={styles.dropZone}>
      <DropBox label="Store in PC" type={'store'} />
      <DropBox label="Keep in your team" type={'keep'} />
      <DropBox label="Release in the wild" type={'release'} />
    </div>
  );
};

const Home: NextPage = () => {
  const { boxes, emptyAll } = useBoxState();
  const { data, refetch } = trpc.useQuery(['pokemon.getThreePokemon']);
  const { mutate } = trpc.useMutation(['vote.commit'], {
    onMutate: () => {
      emptyAll();
    },
    onSuccess: () => {
      refetch();
    }
  });

  return (
    <>
      <Head>
        <title>Store, Keep, Release</title>
        <meta
          name="description"
          content="Store, Keep, Release. A kid-friendly Kiss, Marry, Kill with Pokemon"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Store, Keep, Release</h1>
      <main>
        <button
          onClick={() => {
            if (boxes.keep && boxes.release && boxes.store) {
              mutate({
                store: { pokemonId: boxes.store.id },
                release: { pokemonId: boxes.release.id },
                keep: { pokemonId: boxes.keep.id }
              });
            }
          }}
        >
          Click me to mutate
        </button>
        <DropZone />
        {data ? (
          <div className={styles.choices}>
            <PokemonContainer pokemon={data.first} />
            <PokemonContainer pokemon={data.second} />
            <PokemonContainer pokemon={data.third} />
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </main>
    </>
  );
};

export default Home;
