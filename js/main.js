/*
 * Chocopook · Comportamiento del sitio (sin dependencias)
 * Los datos editables vienen de js/config.js.
 */
(() => {
  "use strict";

  const config = window.CHOCOPOOK_CONFIG || {};

  /* ---------- Links a destinos configurables ---------- */

  // Apunta el link a `url`; si todavía no hay destino, lo deja marcado como pendiente.
  function asignarDestino(enlace, url) {
    if (!url) {
      enlace.setAttribute("data-pendiente", "");
      enlace.title = "¡Muy pronto!";
      return;
    }
    enlace.href = url;
    enlace.removeAttribute("data-pendiente");
    if (/^https?:\/\//.test(url)) {
      enlace.target = "_blank";
      enlace.rel = "noopener";
    }
  }

  function iniciarRedes() {
    const usuario = (config.instagramUsuario || "").trim().replace(/^@/, "");
    const numero = (config.whatsappNumero || "").replace(/\D/g, "");
    const mensaje = config.whatsappMensaje ? `?text=${encodeURIComponent(config.whatsappMensaje)}` : "";

    const destinos = {
      instagram: usuario ? `https://www.instagram.com/${usuario}/` : "",
      whatsapp: numero ? `https://wa.me/${numero}${mensaje}` : "",
    };

    document.querySelectorAll("[data-link]").forEach((enlace) => {
      asignarDestino(enlace, destinos[enlace.dataset.link]);
    });
  }

  // Cada ítem del libro-menú lleva al post de su receta.
  function iniciarRecetas() {
    const recetas = config.recetas || {};
    document.querySelectorAll("[data-receta]").forEach((enlace) => {
      asignarDestino(enlace, recetas[enlace.dataset.receta]);
    });
  }

  /* ---------- Galería: visor de fotos ---------- */

  function iniciarVisor() {
    const visor = document.querySelector(".visor");
    if (!visor || typeof visor.showModal !== "function") return;

    const imagen = visor.querySelector("img");
    const pie = visor.querySelector(".visor__pie");

    document.querySelectorAll(".foto").forEach((boton) => {
      boton.addEventListener("click", () => {
        const miniatura = boton.querySelector("img");
        imagen.src = boton.dataset.grande || miniatura.currentSrc || miniatura.src;
        imagen.alt = miniatura.alt;
        pie.textContent = miniatura.alt;
        visor.showModal();
      });
    });

    // Cierra con la cruz o tocando fuera de la foto (Esc lo maneja el <dialog>).
    visor.addEventListener("click", (evento) => {
      if (evento.target === visor || evento.target.closest(".visor__cerrar")) visor.close();
    });
  }

  /* ---------- Navegación ---------- */

  function iniciarMenuMovil() {
    const boton = document.querySelector(".nav__boton");
    const menu = document.getElementById("nav-menu");
    if (!boton || !menu) return;

    const cambiar = (abrir) => {
      boton.setAttribute("aria-expanded", String(abrir));
      boton.setAttribute("aria-label", abrir ? "Cerrar menú" : "Abrir menú");
      menu.classList.toggle("esta-abierto", abrir);
    };

    boton.addEventListener("click", () => {
      cambiar(boton.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", (evento) => {
      if (evento.target.closest("a")) cambiar(false);
    });
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") cambiar(false);
    });
  }

  // Marca en la barra la sección que se está viendo.
  function iniciarSeccionActiva() {
    const enlaces = [...document.querySelectorAll(".nav__enlaces a[href^='#']")];
    const destinos = enlaces.map((enlace) => document.querySelector(enlace.hash));
    let programado = false;

    const actualizar = () => {
      programado = false;
      const limite = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 20;
      let activo = 0;
      if (window.scrollY > 40) {
        destinos.forEach((destino, i) => {
          if (destino && destino.getBoundingClientRect().top <= limite) activo = i;
        });
      }
      const alFinal = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (alFinal) activo = enlaces.length - 1;
      enlaces.forEach((enlace, i) => {
        if (i === activo) enlace.setAttribute("aria-current", "location");
        else enlace.removeAttribute("aria-current");
      });
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!programado) {
          programado = true;
          requestAnimationFrame(actualizar);
        }
      },
      { passive: true }
    );
    actualizar();
  }

  /* ---------- Arranque ---------- */

  iniciarRedes();
  iniciarRecetas();
  iniciarVisor();
  iniciarMenuMovil();
  iniciarSeccionActiva();
})();
