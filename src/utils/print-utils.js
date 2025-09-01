// src/utils/print-utils.js

const KEY_PREFIX = "printed:";
const STATION_TITLE = {
  kitchen: "КУХНЯ",
  bar: "БАР",
};

/** Зарежда множеството от вече отпечатани редове (по station). */
export function loadPrintedSet(station) {
  try {
    const raw = localStorage.getItem(`${KEY_PREFIX}${station}`) || "[]";
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

/** Добавя новоотпечатаните item IDs към локалния списък (по station). */
export function savePrintedSet(station, ids) {
  const set = loadPrintedSet(station);
  ids.forEach((id) => set.add(id));
  localStorage.setItem(`${KEY_PREFIX}${station}`, JSON.stringify(Array.from(set)));
}

/** Нулира отпечатаните редове за дадена поръчка (само от текущата station). */
export function resetPrintedForOrder(station, order) {
  const set = loadPrintedSet(station);
  (order.items || []).forEach((i) => {
    if (i.station === station) set.delete(i.id);
  });
  localStorage.setItem(`${KEY_PREFIX}${station}`, JSON.stringify(Array.from(set)));
}

/**
 * Печат на кухненски/бар бон през невидим iframe (по-стабилно от window.open).
 * @param {Object} order - { id, table_no, customer_name, items: [...] }
 * @param {"kitchen"|"bar"} station
 * @param {Array} items - редовете за печат (подай НЕотпечатаните!)
 * @returns {Promise<void>}
 */
export function printKitchenTicket(order, station, items = []) {
  const title = STATION_TITLE[station] || (station?.toUpperCase() || "ПОРЪЧКА");

  const rows =
    items && items.length ? items : (order.items || []).filter((i) => i.station === station);

  // няма какво да печатаме → тихо излизаме
  if (!rows.length) return Promise.resolve();

  const now = new Date();
  const time = now.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });

  const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title} — #${order.id}</title>
  <style>
    /* 80mm термопринтер */
    @page { size: 80mm auto; margin: 6mm 4mm; }
    * { box-sizing: border-box; }
    body { font: 14px/1.25 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif; }
    .center { text-align: center; }
    .title { font-weight: 800; font-size: 18px; letter-spacing: 1px; margin: 0 0 8px; text-align: center; }
    .meta { font-size: 12px; margin-bottom: 8px; text-align: center; }
    .line { border-top: 1px dashed #000; margin: 8px 0; }
    .row { display: flex; gap: 8px; margin: 6px 0; }
    .name { flex: 1 1 auto; }
    .qty { width: 28px; text-align: right; font-weight: 700; }
    .note { font-size: 12px; opacity: .9; margin: 2px 0 0 0; }
    .footer { margin-top: 10px; font-size: 12px; text-align: center; }
    .bold { font-weight: 700; }
  </style>
</head>
<body>
  <div class="title">${title}</div>
  <div class="meta">
    Поръчка <span class="bold">#${order.id}</span>
    ${order.table_no ? ` · Маса <span class="bold">${order.table_no}</span>` : ""}
    ${order.customer_name ? ` · Клиент <span class="bold">${order.customer_name}</span>` : ""}
    <div>${time}</div>
  </div>
  <div class="line"></div>

  ${rows.map(i => `
    <div class="row">
      <div class="name">${escapeHtml(i.name)}</div>
      <div class="qty">×${i.qty}</div>
    </div>
    ${i.note ? `<div class="note">Бележка: ${escapeHtml(i.note)}</div>` : ""}
  `).join("")}

  <div class="line"></div>
  <div class="footer">Благодарим!</div>
</body>
</html>
`.trim();

  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");

    iframe.onload = () => {
      try {
        const w = iframe.contentWindow;
        // Някои браузъри искат лека пауза преди print, за да си сложат layout-а
        setTimeout(() => {
          w.focus();
          w.print();
          // малко изчакване и чистим iframe-а
          setTimeout(() => {
            iframe.remove();
            resolve();
          }, 200);
        }, 20);
      } catch {
        iframe.remove();
        resolve();
      }
    };

    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
  });
}

/* безопасен HTML */
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
