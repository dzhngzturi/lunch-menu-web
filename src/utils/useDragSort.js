import { useRef, useState } from "react";

/** Лек универсален DnD hook за таблици/списъци.
 * @param {Array} items - текущият масив
 * @param {(nextIds:number[])=>Promise<void>|void} onCommit - извиква се след drop с масив от id-та (оптимистично)
 * @param {(item:any)=>any} getId - как взимаме id от елемент (default: item.id)
 * @returns {object} API за вързване към редове/елементи
 */
export function useDragSort(items, onCommit, getId = x => x.id) {
  const [dragId, setDragId] = useState(null);
  const prevRef = useRef(items);

  function move(arr, from, to) {
    const copy = arr.slice();
    const item = copy.splice(from, 1)[0];
    copy.splice(to, 0, item);
    return copy;
  }

  const onDragStart = (id) => setDragId(id);
  const onDragOver  = (e) => e.preventDefault();

  const onDrop = async (targetId, setItems) => {
    if (!dragId || dragId === targetId) return;
    const from = items.findIndex(x => getId(x) === dragId);
    const to   = items.findIndex(x => getId(x) === targetId);
    if (from < 0 || to < 0) return;

    prevRef.current = items;
    const next = move(items, from, to);
    setItems(next);                  
    setDragId(null);

    try {
      const ids = next.map(getId);
      await onCommit?.(ids);
    } catch (err) {
      // rollback при грешка
      setItems(prevRef.current);
      throw err;
    }
  };

  return {
    dragId,
    bindRow: (item, setItems) => ({
      draggable: true,
      onDragStart: () => onDragStart(getId(item)),
      onDragOver,
      onDrop: () => onDrop(getId(item), setItems),
    }),
  };
}
