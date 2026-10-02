/*
 * Chocopook · Cursor estrella (sin dependencias)
 * - Con el mouse, la estrella la dibuja la página todo el tiempo (html.cursor-propio);
 *   sobre links y botones solo empieza a girar y palpitar. Como no hay cambio de cursor
 *   al entrar a un link, no hay parpadeo.
 * - En los campos de texto, los links pendientes, el visor de fotos y el video
 *   se usa el cursor nativo (css/cursor.css).
 * - Al mover el mouse queda una estela corta de chispitas pixeladas.
 * Liviano: el mouse se procesa una vez por cuadro y las chispas (pocas y reutilizadas)
 * las anima el navegador con Web Animations, sin un bucle de JS por cuadro.
 * Solo con mouse. Si la persona pidió reducir el movimiento, queda la estrella nativa quieta.
 */
(() => {
  "use strict";

  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const INTERACTIVOS = 'a[href], button, label, summary, select, [role="button"], .producto, .foto';
  const ESCRIBIR = 'textarea, input:not([type="radio"]):not([type="checkbox"]):not([type="button"]):not([type="submit"])';
  const raiz = document.documentElement;

  /* ---------- Estrella ---------- */

  const estrella = document.createElement("div");
  estrella.className = "cursor-estrella";
  estrella.setAttribute("aria-hidden", "true");
  estrella.innerHTML =
    '<div class="cursor-estrella__giro"><div class="cursor-estrella__latido">' +
    '<img src="assets/cursor/estrella.svg" alt="" width="32" height="32">' +
    "</div></div>";
  document.body.append(estrella);

  // La estrella de la página reemplaza al cursor nativo recién cuando su imagen está lista.
  let lista = false;
  const imagen = estrella.querySelector("img");
  (imagen.decode ? imagen.decode() : Promise.resolve()).then(
    () => (lista = true),
    () => (lista = imagen.complete && imagen.naturalWidth > 0)
  );

  let activo = false;
  let enHover = false;
  let oculta = false;

  // Lugares donde manda el cursor nativo: escribir, links pendientes, visor (capa superior) y video.
  function usaNativo(el) {
    if (!(el instanceof Element)) return true;
    return el.tagName === "IFRAME" || el.matches(ESCRIBIR) || !!el.closest("[data-pendiente], dialog[open]");
  }

  function quiereHover(el) {
    if (document.body.classList.contains("arrastrando")) return false;
    const objetivo = el.closest(INTERACTIVOS);
    return !!objetivo && !objetivo.matches(":disabled");
  }

  function ocultar(valor) {
    if (valor === oculta) return;
    oculta = valor;
    estrella.classList.toggle("cursor-estrella--oculta", valor);
  }

  function ponerHover(valor) {
    if (valor === enHover) return;
    enHover = valor;
    // la clase va en la estrella (no en <html>): así el navegador no recorre toda la página en cada hover
    estrella.classList.toggle("cursor-estrella--hover", valor);
  }

  /* ---------- Estela ---------- */

  const COLORES = ["#ffe45c", "#f6de40", "#f6de40", "#f5c242", "#f2ac3a", "#e8732c"];
  const CANTIDAD = 14; // chispas en pantalla como máximo
  const PASO = 14; // px de recorrido entre chispa y chispa
  const entre = (a, b) => a + Math.random() * (b - a);

  const chispas = Array.from({ length: CANTIDAD }, () => {
    const c = document.createElement("span");
    c.className = "cursor-chispa";
    c.setAttribute("aria-hidden", "true");
    document.body.append(c);
    return { el: c, animacion: null };
  });
  let turno = 0;

  function chispa(x, y) {
    const c = chispas[turno];
    turno = (turno + 1) % CANTIDAD;
    if (c.animacion) c.animacion.cancel();

    const cruz = Math.random() < 0.25;
    c.el.className = cruz ? "cursor-chispa cursor-chispa--cruz" : "cursor-chispa";
    c.el.style.setProperty("--t", `${cruz ? 9 : Math.random() < 0.5 ? 4 : 6}px`);
    c.el.style.setProperty("--c", COLORES[Math.floor(Math.random() * COLORES.length)]);

    // posiciones en píxeles enteros, para que se vea pixelado como la estrella
    const x0 = Math.round(x + entre(-3, 3)), y0 = Math.round(y + entre(-3, 3));
    const x1 = Math.round(x0 + entre(-6, 6)), y1 = Math.round(y0 + entre(4, 12)); // cae un poquito, como azúcar
    c.animacion = c.el.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) scale(1)`, opacity: 1 },
        { transform: `translate(${x1}px, ${y1}px) scale(.4)`, opacity: 0 },
      ],
      { duration: entre(260, 420), easing: "ease-out", fill: "forwards" }
    );
  }

  /* ---------- Mouse: una vez por cuadro ---------- */

  let x = -100, y = -100;
  let objetivo = null; // undefined = hay que averiguar qué hay debajo (después de un scroll)
  let pendiente = false;
  let anterior = null;
  let recorrido = 0;

  function pedirCuadro() {
    if (!pendiente) {
      pendiente = true;
      requestAnimationFrame(cuadro);
    }
  }

  function cuadro() {
    pendiente = false;
    estrella.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    // con el primer movimiento (y la imagen lista) la estrella de la página pasa a ser el cursor
    if (!activo && lista) {
      activo = true;
      raiz.classList.add("cursor-propio");
    }
    const debajo = objetivo === undefined ? document.elementFromPoint(x, y) : objetivo;
    const nativo = usaNativo(debajo);
    ocultar(nativo);
    ponerHover(!nativo && quiereHover(debajo));

    if (anterior) {
      recorrido += Math.hypot(x - anterior.x, y - anterior.y);
      if (recorrido >= PASO) {
        recorrido = 0;
        chispa(x, y); // como mucho una por cuadro
      }
    }
    anterior = { x, y };
  }

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      objetivo = e.target;
      pedirCuadro();
    },
    { passive: true }
  );

  // al entrar a un iframe (el video) la página deja de recibir el mouse: manda el cursor del video
  document.addEventListener("pointerover", (e) => {
    if (e.target.tagName === "IFRAME") {
      ocultar(true);
      ponerHover(false);
    }
  });

  // al salir de la ventana
  raiz.addEventListener("mouseleave", () => {
    ocultar(true);
    ponerHover(false);
    anterior = null;
  });

  // si la página se mueve debajo del mouse quieto, se revisa qué quedó abajo
  addEventListener(
    "scroll",
    () => {
      if (x < 0) return;
      objetivo = undefined;
      anterior = null; // el scroll no deja estela
      pedirCuadro();
    },
    { passive: true, capture: true }
  );
})();
