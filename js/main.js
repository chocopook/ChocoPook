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
    const mensajes = config.whatsappMensajes || {};

    // cada link de WhatsApp abre el chat con su mensaje (data-mensaje; por defecto, "consulta")
    const whatsapp = (clave) => {
      if (!numero) return "";
      const texto = mensajes[clave] || mensajes.consulta || "";
      return `https://wa.me/${numero}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
    };
    const instagram = usuario ? `https://www.instagram.com/${usuario}/` : "";
    const youtube = (config.youtubeCanal || "").trim();

    document.querySelectorAll("[data-link]").forEach((enlace) => {
      const red = enlace.dataset.link;
      const destinos = { instagram, youtube };
      asignarDestino(enlace, red === "whatsapp" ? whatsapp(enlace.dataset.mensaje) : destinos[red] || "");
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

  /* ---------- Galería: flechas que avanzan de a una columna ---------- */

  function iniciarGaleria() {
    const grilla = document.querySelector(".vitrina__grilla");
    const anterior = document.querySelector(".vitrina__flecha--anterior");
    const siguiente = document.querySelector(".vitrina__flecha--siguiente");
    if (!grilla || !anterior || !siguiente) return;
    const sinMovimiento = matchMedia("(prefers-reduced-motion: reduce)");

    // distancia de una columna a la siguiente (las fotos se llenan de a columnas: 1.ª y 3.ª arriba)
    const paso = () => {
      const [primera, , tercera] = grilla.children;
      return tercera ? tercera.offsetLeft - primera.offsetLeft : grilla.clientWidth;
    };

    function actualizar() {
      const max = grilla.scrollWidth - grilla.clientWidth;
      const hayMas = max > 2; // las flechas solo aparecen si hay fotos que no entran
      anterior.hidden = siguiente.hidden = !hayMas;
      anterior.setAttribute("aria-disabled", String(grilla.scrollLeft <= 2));
      siguiente.setAttribute("aria-disabled", String(grilla.scrollLeft >= max - 2));
    }

    // Animación propia (en vez de scroll "smooth"): el encastre de columnas se apaga mientras
    // dura, así no pelea con el desplazamiento y no frena a los tirones al final.
    let destino = null;
    let animacion = 0;
    const suave = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    function mover(direccion) {
      const p = paso();
      const max = grilla.scrollWidth - grilla.clientWidth;
      // clics seguidos: se suma a donde iba, no a donde está
      const desde = destino ?? grilla.scrollLeft;
      destino = Math.max(0, Math.min(max, (Math.round(desde / p) + direccion) * p));
      if (sinMovimiento.matches) {
        grilla.scrollLeft = destino;
        destino = null;
        return;
      }
      cancelAnimationFrame(animacion);
      const inicio = grilla.scrollLeft, recorrido = destino - inicio, t0 = performance.now(), duracion = 420;
      grilla.style.scrollSnapType = "none";
      const paso_ = (ahora) => {
        const t = Math.min((ahora - t0) / duracion, 1);
        grilla.scrollLeft = inicio + recorrido * suave(t);
        if (t < 1) animacion = requestAnimationFrame(paso_);
        else {
          grilla.style.scrollSnapType = "";
          destino = null;
        }
      };
      animacion = requestAnimationFrame(paso_);
    }

    anterior.addEventListener("click", () => mover(-1));
    siguiente.addEventListener("click", () => mover(1));

    let programado = false;
    grilla.addEventListener(
      "scroll",
      () => {
        if (programado) return;
        programado = true;
        requestAnimationFrame(() => {
          programado = false;
          actualizar();
        });
      },
      { passive: true }
    );
    if ("ResizeObserver" in window) new ResizeObserver(actualizar).observe(grilla);
    else addEventListener("resize", actualizar);
    actualizar();
  }

  /* ---------- Receta del día (YouTube) ---------- */

  // Acepta un link de YouTube (watch, youtu.be, shorts, embed, live) o el ID solo.
  function idDeYoutube(valor) {
    const texto = (valor || "").trim();
    if (/^[\w-]{11}$/.test(texto)) return texto;
    const encontrado = texto.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})/);
    return encontrado ? encontrado[1] : "";
  }

  // Muestra solo la miniatura; el reproductor de YouTube se carga recién al tocar play.
  function iniciarRecetaDelDia() {
    const contenedor = document.querySelector("[data-video]");
    if (!contenedor) return;

    const receta = config.recetaDelDia || {};
    const titulo = receta.titulo || "Receta del día";
    document.querySelectorAll("[data-receta-titulo]").forEach((elemento) => {
      elemento.textContent = titulo;
    });

    const id = idDeYoutube(receta.youtube);
    if (!id) return;

    const portada = contenedor.querySelector(".video__portada");
    const miniatura = portada.querySelector("img");
    miniatura.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    contenedor.querySelector(".video__aviso")?.remove();
    portada.disabled = false;
    portada.setAttribute("aria-label", `Reproducir video: ${titulo}`);

    portada.addEventListener(
      "click",
      () => {
        const reproductor = document.createElement("iframe");
        reproductor.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
        reproductor.title = `Video: ${titulo}`;
        reproductor.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        reproductor.referrerPolicy = "strict-origin-when-cross-origin";
        reproductor.allowFullscreen = true;
        portada.replaceWith(reproductor);
        reproductor.focus();
      },
      { once: true }
    );
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
    // En páginas aparte (como pedido.html) la barra ya marca la página fija.
    if (document.querySelector(".nav__enlaces a[aria-current='page']")) return;
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

  function actualizarAnio() {
    const anio = String(new Date().getFullYear());
    document.querySelectorAll("[data-anio]").forEach((elemento) => {
      elemento.textContent = anio;
    });
  }

  /* ---------- Arranque ---------- */

  iniciarRedes();
  iniciarVisor();
  iniciarGaleria();
  iniciarRecetaDelDia();
  iniciarMenuMovil();
  iniciarSeccionActiva();
  actualizarAnio();
})();
