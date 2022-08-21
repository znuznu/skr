import Image from 'next/image';
import { useDrag, useDrop } from 'react-dnd';

import { BoxType, useBoxState } from '@/state/box';

import styles from './DropZone.module.scss';
import { ItemTypes } from '@/utils/dnd';
import { Pokemon } from '../PokemonContainer';

type TypeWrapper = { type: BoxType };
const isTypeWrapper = (o: unknown): o is TypeWrapper => {
  return typeof o === 'object' && o !== null && 'type' in o;
};

type DropBoxProps = {
  label: string;
  type: BoxType;
  text: string;
};
const DropBox = ({ label, type, text }: DropBoxProps) => {
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
      <div className={styles.boxLabel}>{label}</div>
      <div className={styles.dropBox} ref={drop}>
        {boxes[type] === undefined && <p>{text}</p>}
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
      <DropBox label="Store" type={'store'} text={'Put in Storage System'} />
      <DropBox label="Keep" type={'keep'} text={'Keep in your team'} />
      <DropBox label="Release" type={'release'} text={'Release in the wild'} />
    </div>
  );
};

export default DropZone;
