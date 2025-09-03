// src/lib/echo.js
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Reverb говори Pusher-протокол → ползваме pusher-js клиента
window.Pusher = Pusher;

const KEY   = import.meta.env.VITE_REVERB_APP_KEY;
const HOST  = import.meta.env.VITE_REVERB_HOST || window.location.hostname;
const PORT  = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const TLS   = (import.meta.env.VITE_REVERB_SCHEME || "http") === "https";

export const echo = new Echo({
  broadcaster: "reverb",
  key: KEY,
  wsHost: HOST,
  wsPort: PORT,
  wssPort: PORT,
  forceTLS: TLS,
  enabledTransports: ["ws", "wss"],
});
