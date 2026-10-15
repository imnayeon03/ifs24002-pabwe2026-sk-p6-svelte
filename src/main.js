import "@fontsource-variable/plus-jakarta-sans";
import { mount } from "svelte";
import App from "./App.svelte";
import "./index.css";

// CSS hasil build dimuat tanpa memblokir render (lihat vite.config.js). Supaya
// konten tidak sempat tampil tanpa gaya lalu "melompat" saat CSS datang
// (layout shift), aplikasi baru dipasang setelah stylesheet siap. Ada batas
// waktu agar halaman tetap tampil jika CSS gagal dimuat.
function waitForStylesheet(timeout = 3000) {
  return new Promise((resolve) => {
    const link = document.querySelector('link[rel="stylesheet"][media="print"]');
    if (!link || link.sheet) {
      resolve();
      return;
    }
    link.addEventListener("load", () => resolve(), { once: true });
    link.addEventListener("error", () => resolve(), { once: true });
    setTimeout(resolve, timeout);
  });
}

await waitForStylesheet();

const app = mount(App, {
  target: document.getElementById("app"),
});

export default app;