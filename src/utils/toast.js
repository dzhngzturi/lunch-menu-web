// прост импeративен тостер
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

  // плавно показване
  requestAnimationFrame(() => el.classList.add("show"));

  // автозатваряне
  setTimeout(() => {
    el.classList.remove("show");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  }, 2600);
}
