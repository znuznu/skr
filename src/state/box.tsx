import { Pokemon } from '@/components/PokemonContainer';
import create from 'zustand';

type Box = {
  store: Pokemon | undefined;
  keep: Pokemon | undefined;
  release: Pokemon | undefined;
};
export type BoxType = keyof Box;

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
  isFull: () => boolean;
}

const emptyBoxes = { store: undefined, keep: undefined, release: undefined };

export const useBoxState = create<BoxState>()((set, get) => ({
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
  },
  isFull: () => {
    return (
      get().boxes.store !== undefined &&
      get().boxes.keep !== undefined &&
      get().boxes.release !== undefined
    );
  }
}));
