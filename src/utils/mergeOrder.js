export function mergeOrder(list, order) {
  const i = list.findIndex(o => o.id === order.id);
  if (i === -1) return [order, ...list];        // нова поръчка
  const copy = [...list];
  copy[i] = order;                               // обновена поръчка
  return copy;
}
