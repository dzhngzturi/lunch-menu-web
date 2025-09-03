import { useEffect } from 'react';
import { echo } from '@/lib/echo';
import { mergeOrder } from '@/utils/mergeOrder';

export default function useOrdersChannel(updateList) {
  useEffect(() => {
    const ch = echo.channel('orders');

    const onUpdated = ({ order }) => {
      updateList(prev => mergeOrder(prev, order));
    };

    ch.listen('.order.updated', onUpdated);

    // (по избор) малко логове за дебъг
    echo.connector.pusher.connection.bind('connected',   () => console.log('[Echo] connected'));
    echo.connector.pusher.connection.bind('error',       e  => console.warn('[Echo] error', e));
    echo.connector.pusher.connection.bind('unavailable', () => console.warn('[Echo] unavailable'));

    return () => {
      ch.stopListening('.order.updated');
    };
  }, [updateList]);
}
