// src/utils/toast.js
export function showToast(message, type = "success") {
  const hostId = "toast-host";
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement("div");
    host.id = hostId;
    host.className = "toast-container";
    document.body.appendChild(host);
  }

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = message;

  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));

  setTimeout(() => {
    el.classList.remove("show");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }, 2600);
}

// добави тези два named export-а:
export const toastSuccess = (msg) => showToast(msg, "success");
export const toastError   = (msg) => showToast(msg, "error");
