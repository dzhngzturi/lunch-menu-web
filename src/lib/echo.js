// src/lib/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// laravel-echo изисква това:
window.Pusher = Pusher;

const KEY     = import.meta.env.VITE_PUSHER_KEY || '';
const CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'eu';

// Ако няма ключ – не инициализирай Echo, за да не крашва приложението
let echo = null;

if (KEY) {
  echo = new Echo({
    broadcaster: 'pusher',
    key: KEY,
    cluster: CLUSTER,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],
    // (по желание) ако искаш експлицитно хост/порт:
    // wsHost: `ws-${CLUSTER}.pusher.com`,
    // wsPort: 80,
    // wssPort: 443,
  });
} else {
  console.warn('[Echo] VITE_PUSHER_KEY липсва – Echo няма да бъде стартиран.');
}

export default echo;
// ако някъде ползваш именован импорт:
export { echo };
