/*
 * Chocopook · Armá tu pedido (pedido.html)
 * - Los productos salen de js/config.js (productos).
 * - Con mouse se arrastran hasta la canasta; con un toque (o Enter) vuelan solos.
 * - El pedido se guarda en este navegador y se envía por WhatsApp.
 * Sin dependencias.
 */
(() => {
  "use strict";

  const config = window.CHOCOPOOK_CONFIG || {};
  const productos = config.productos || [];
  const porId = new Map(productos.map((p) => [p.id, p]));
  const dibujo = (id) => `assets/svg/productos/${id}.svg`;

  const CLAVE = "chocopook-pedido";
  const MAX_CANTIDAD = 99;
  const MAX_PILA = 30; // unidades que se dibujan en la canasta (el resto solo se cuenta)
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const $ = (selector) => document.querySelector(selector);
  const zona = $("[data-zona]");
  const pila = $(".canasta__pila");
  const lista = $(".ticket__lista");
  const vacio = $(".ticket__vacio");
  const notas = $("#notas");
  const enviar = $("[data-enviar]");
  const botonVaciar = $(".ticket__vaciar");
  const barra = $("[data-barra-pedido]");
  const anuncio = $("[data-anuncio]");
  const aviso = $("[data-aviso]");
  if (!zona || !pila || !lista) return;

  /* ---------- Estado ---------- */

  const pedido = new Map(); // id -> cantidad, en el orden en que se eligieron
  const enPila = []; // un elemento por unidad dibujada en la canasta, en orden de llegada

  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ items: [...pedido], notas: notas.value }));
    } catch {
      /* sin almacenamiento disponible: el pedido vive solo en esta visita */
    }
  }

  function cargar() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE) || "null");
      if (!datos) return;
      for (const [id, n] of datos.items || []) {
        if (porId.has(id) && n > 0) pedido.set(id, Math.min(n, MAX_CANTIDAD));
      }
      notas.value = datos.notas || "";
    } catch {
      /* datos viejos o ilegibles: se arranca con la canasta vacía */
    }
  }

  const total = () => [...pedido.values()].reduce((a, b) => a + b, 0);

  /* ---------- Estantería ---------- */

  function armarEstanteria() {
    document.querySelectorAll("[data-tipo]").forEach((ul) => {
      for (const p of productos.filter((p) => p.tipo === ul.dataset.tipo)) {
        const li = document.createElement("li");
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "producto";
        boton.dataset.id = p.id;
        boton.setAttribute("aria-label", `Agregar ${p.nombre} a la canasta`);

        const img = document.createElement("img");
        img.src = dibujo(p.id);
        img.alt = "";
        img.width = img.height = 100;
        img.draggable = false;

        const mas = document.createElement("span");
        mas.className = "producto__mas";
        mas.setAttribute("aria-hidden", "true");
        mas.textContent = "+";

        const nombre = document.createElement("span");
        nombre.className = "producto__nombre";
        nombre.textContent = p.nombre;

        boton.append(img, mas, nombre);
        li.append(boton);
        ul.append(li);
      }
    });
  }

  /* ---------- Pila de la canasta ---------- */

  // Ubicación de la unidad i: filas que se angostan hacia arriba, como una montañita.
  function lugar(i, el) {
    let fila = 0, resto = i, cap = 6;
    while (resto >= cap) {
      resto -= cap;
      fila += 1;
      cap = 6 - Math.min(fila, 3);
    }
    const ancho = 16.5; // separación entre centros, en % del ancho de la pila
    const izquierda = 50 - ((cap - 1) * ancho) / 2 + resto * ancho + Number(el.dataset.jx);
    const abajo = fila * 21 + Number(el.dataset.jy);
    return { izquierda, abajo };
  }

  function acomodar() {
    enPila.forEach((el, i) => {
      const { izquierda, abajo } = lugar(i, el);
      el.style.left = `${izquierda}%`;
      el.style.bottom = `${abajo}%`;
      el.style.zIndex = String(i + 1);
    });
  }

  function sumarAPila(id, caer) {
    if (enPila.length >= MAX_PILA) return;
    const el = document.createElement("img");
    el.src = dibujo(id);
    el.alt = "";
    el.className = "pila__item";
    el.dataset.id = id;
    el.dataset.jx = String((Math.random() - 0.5) * 5);
    el.dataset.jy = String((Math.random() - 0.5) * 4);
    el.style.setProperty("--giro", `${Math.round((Math.random() - 0.5) * 44)}deg`);
    if (caer && !sinMovimiento) el.classList.add("pila__item--cae");
    pila.append(el);
    enPila.push(el);
    acomodar();
  }

  function sacarDePila(id, cuantas) {
    for (let i = enPila.length - 1; i >= 0 && cuantas > 0; i--) {
      if (enPila[i].dataset.id !== id) continue;
      const [el] = enPila.splice(i, 1);
      cuantas -= 1;
      if (sinMovimiento) el.remove();
      else {
        el.classList.add("pila__item--sale");
        el.addEventListener("animationend", () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 500); // por si la animación no termina (pestaña en segundo plano)
      }
    }
    // si quedaron unidades sin dibujar (por el tope), se completan
    for (const [pid, n] of pedido) {
      let dibujadas = enPila.filter((el) => el.dataset.id === pid).length;
      while (dibujadas < n && enPila.length < MAX_PILA) {
        sumarAPila(pid, false);
        dibujadas += 1;
      }
    }
    acomodar();
  }

  /* ---------- Acciones ---------- */

  function agregar(id, { caer = true } = {}) {
    const p = porId.get(id);
    if (!p) return;
    const n = pedido.get(id) || 0;
    if (n >= MAX_CANTIDAD) return;
    pedido.set(id, n + 1);
    sumarAPila(id, caer);
    if (caer) festejar();
    actualizar();
    decir(`Agregaste ${p.nombre}. Tenés ${n + 1} en el pedido.`);
  }

  function quitar(id, todo = false) {
    const p = porId.get(id);
    const n = pedido.get(id) || 0;
    if (!p || !n) return;
    const quedan = todo ? 0 : n - 1;
    if (quedan) pedido.set(id, quedan);
    else pedido.delete(id);
    sacarDePila(id, n - quedan);
    actualizar();
    decir(quedan ? `Quedan ${quedan} de ${p.nombre}.` : `Sacaste ${p.nombre} del pedido.`);
  }

  function vaciarTodo() {
    for (const id of [...pedido.keys()]) quitar(id, true);
    decir("Vaciaste la canasta.");
  }

  /* ---------- Ticket y envío ---------- */

  function filaTicket(id) {
    const p = porId.get(id);
    const li = document.createElement("li");
    li.className = "ticket__item";
    li.dataset.id = id;

    const img = document.createElement("img");
    img.src = dibujo(id);
    img.alt = "";
    img.width = img.height = 40;

    const nombre = document.createElement("span");
    nombre.className = "ticket__nombre";
    nombre.textContent = p.nombre;

    const cantidad = document.createElement("span");
    cantidad.className = "cantidad";
    cantidad.innerHTML =
      `<button type="button" class="cantidad__boton" data-accion="menos">−</button>` +
      `<output class="cantidad__numero"></output>` +
      `<button type="button" class="cantidad__boton" data-accion="mas">+</button>`;
    cantidad.querySelector("[data-accion=menos]").setAttribute("aria-label", `Uno menos de ${p.nombre}`);
    cantidad.querySelector("[data-accion=mas]").setAttribute("aria-label", `Uno más de ${p.nombre}`);

    const sacar = document.createElement("button");
    sacar.type = "button";
    sacar.className = "ticket__sacar";
    sacar.dataset.accion = "sacar";
    sacar.setAttribute("aria-label", `Sacar ${p.nombre} del pedido`);
    sacar.textContent = "×";

    li.append(img, nombre, cantidad, sacar);
    return li;
  }

  // Actualiza las filas sin rehacerlas, así no se pierde el foco del botón que se está usando.
  function pintarTicket() {
    const filas = new Map([...lista.children].map((li) => [li.dataset.id, li]));
    for (const [id, n] of pedido) {
      let li = filas.get(id);
      if (!li) {
        li = filaTicket(id);
        lista.append(li);
      }
      li.querySelector(".cantidad__numero").textContent = String(n);
      filas.delete(id);
    }
    filas.forEach((li) => li.remove());
  }

  function mensaje() {
    const saludo = (config.whatsappMensaje || "¡Hola Chocopook! Quiero hacer un pedido").trim().replace(/[.:!¡\s]+$/, "");
    const lineas = [...pedido].map(([id, n]) => `• ${n} × ${porId.get(id).nombre}`);
    let texto = `${saludo}:\n\n${lineas.join("\n")}`;
    const extra = notas.value.trim();
    if (extra) texto += `\n\nAclaraciones: ${extra}`;
    return texto;
  }

  const numeroWhatsapp = () => (config.whatsappNumero || "").replace(/\D/g, "");

  function actualizarEnvio() {
    const numero = numeroWhatsapp();
    const listo = pedido.size > 0 && numero;
    // se ve apagado solo con la canasta vacía; sin número cargado avisa "¡Muy pronto!" al tocarlo
    enviar.classList.toggle("esta-deshabilitado", pedido.size === 0);
    enviar.setAttribute("aria-disabled", String(!listo));
    if (listo) {
      enviar.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje())}`;
      enviar.target = "_blank";
      enviar.rel = "noopener";
    } else {
      enviar.href = "#";
      enviar.removeAttribute("target");
    }
  }

  function actualizar() {
    pintarTicket();
    const hay = pedido.size > 0;
    vacio.hidden = hay;
    botonVaciar.hidden = !hay;
    actualizarEnvio();
    if (barra) {
      barra.querySelector("[data-total]").textContent = String(total());
      barra.classList.toggle("tiene-algo", hay);
    }
    guardar();
  }

  /* ---------- Avisos ---------- */

  function decir(texto) {
    if (anuncio) anuncio.textContent = texto;
  }

  let temporizadorAviso;
  function avisar(texto) {
    if (!aviso) return;
    aviso.textContent = texto;
    aviso.classList.add("es-visible");
    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => aviso.classList.remove("es-visible"), 2600);
  }

  // "+1" que sube desde la canasta
  function festejar() {
    if (sinMovimiento) return;
    const mas = document.createElement("span");
    mas.className = "mas-uno";
    mas.textContent = "+1";
    mas.setAttribute("aria-hidden", "true");
    zona.append(mas);
    mas.addEventListener("animationend", () => mas.remove(), { once: true });
    zona.classList.remove("canasta__dibujo--recibe");
    void zona.offsetWidth; // reinicia la animación
    zona.classList.add("canasta__dibujo--recibe");
  }

  /* ---------- Arrastrar y volar ---------- */

  function crearFantasma(id, ancho) {
    const img = document.createElement("img");
    img.src = dibujo(id);
    img.alt = "";
    img.className = "fantasma";
    img.style.width = `${ancho}px`;
    document.body.append(img);
    return img;
  }

  const enPantalla = (rect) => rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0;

  // A dónde vuela un producto que se agrega con un toque: la canasta si se ve, si no la barrita de abajo.
  function destino() {
    const r = zona.getBoundingClientRect();
    if (enPantalla(r)) return { x: r.left + r.width / 2, y: r.top + r.height * 0.42 };
    if (barra && getComputedStyle(barra).display !== "none") {
      const b = barra.getBoundingClientRect();
      return { x: b.left + 34, y: b.top + b.height / 2 };
    }
    return null;
  }

  function volar(boton) {
    const id = boton.dataset.id;
    boton.classList.remove("producto--salta");
    void boton.offsetWidth;
    boton.classList.add("producto--salta");
    const hacia = destino();
    const origen = boton.querySelector("img").getBoundingClientRect();
    if (sinMovimiento || !hacia || !origen.width) {
      agregar(id, { caer: Boolean(hacia) });
      return;
    }
    const x0 = origen.left + origen.width / 2, y0 = origen.top + origen.height / 2;
    const alto = Math.min(y0, hacia.y) - 110;
    const fantasma = crearFantasma(id, origen.width);
    const vuelo = fantasma.animate(
      [
        { transform: `translate(${x0}px, ${y0}px) translate(-50%, -50%) rotate(0deg) scale(1)` },
        { transform: `translate(${(x0 + hacia.x) / 2}px, ${alto}px) translate(-50%, -50%) rotate(-25deg) scale(.95)`, offset: 0.5 },
        { transform: `translate(${hacia.x}px, ${hacia.y}px) translate(-50%, -50%) rotate(12deg) scale(.6)` },
      ],
      { duration: 650, easing: "cubic-bezier(.45,.05,.35,1)" }
    );
    vuelo.onfinish = () => {
      fantasma.remove();
      agregar(id, { caer: true });
    };
  }

  function iniciarArrastre() {
    let arrastre = null;
    let ignorarClick = false;

    const sobreZona = (x, y) => {
      const r = zona.getBoundingClientRect();
      return x > r.left - 24 && x < r.right + 24 && y > r.top - 24 && y < r.bottom + 24;
    };
    const mover = (el, x, y) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(-8deg) scale(1.08)`;
    };
    const terminar = () => {
      document.body.classList.remove("arrastrando");
      zona.classList.remove("canasta__dibujo--encima");
    };

    document.addEventListener("pointerdown", (e) => {
      const boton = e.target.closest(".producto");
      // con el dedo no se arrastra (se scrollearía la página): un toque alcanza para agregar
      if (!boton || e.button !== 0 || e.pointerType === "touch") return;
      arrastre = { boton, id: boton.dataset.id, x0: e.clientX, y0: e.clientY, fantasma: null };
    });

    document.addEventListener("pointermove", (e) => {
      if (!arrastre) return;
      if (!arrastre.fantasma) {
        if (Math.hypot(e.clientX - arrastre.x0, e.clientY - arrastre.y0) < 6) return;
        arrastre.fantasma = crearFantasma(arrastre.id, 92);
        document.body.classList.add("arrastrando");
      }
      mover(arrastre.fantasma, e.clientX, e.clientY);
      zona.classList.toggle("canasta__dibujo--encima", sobreZona(e.clientX, e.clientY));
    });

    document.addEventListener("pointerup", (e) => {
      if (!arrastre) return;
      const { fantasma, id, boton } = arrastre;
      arrastre = null;
      if (!fantasma) return; // fue un click común
      ignorarClick = true;
      setTimeout(() => (ignorarClick = false), 0);
      terminar();
      if (sobreZona(e.clientX, e.clientY)) {
        fantasma.remove();
        agregar(id, { caer: true });
        return;
      }
      // no cayó en la canasta: vuelve a su estante
      const r = boton.querySelector("img").getBoundingClientRect();
      const vuelta = fantasma.animate(
        [{ transform: fantasma.style.transform }, { transform: `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px) translate(-50%, -50%) scale(.9)`, opacity: 0.4 }],
        { duration: sinMovimiento ? 1 : 280, easing: "ease-in" }
      );
      vuelta.onfinish = () => fantasma.remove();
    });

    document.addEventListener("pointercancel", () => {
      if (arrastre?.fantasma) arrastre.fantasma.remove();
      arrastre = null;
      terminar();
    });

    // click, toque o Enter sobre un producto: vuela a la canasta
    document.addEventListener("click", (e) => {
      const boton = e.target.closest(".producto");
      if (!boton || ignorarClick) return;
      volar(boton);
    });
  }

  /* ---------- Eventos del ticket ---------- */

  lista.addEventListener("click", (e) => {
    const accion = e.target.closest("[data-accion]");
    if (!accion) return;
    const id = accion.closest(".ticket__item").dataset.id;
    if (accion.dataset.accion === "mas") agregar(id, { caer: enPantalla(zona.getBoundingClientRect()) });
    if (accion.dataset.accion === "menos") quitar(id);
    if (accion.dataset.accion === "sacar") quitar(id, true);
  });

  notas.addEventListener("input", () => {
    actualizarEnvio();
    guardar();
  });

  botonVaciar.addEventListener("click", vaciarTodo);

  enviar.addEventListener("click", (e) => {
    if (enviar.getAttribute("aria-disabled") !== "true") return;
    e.preventDefault();
    if (!pedido.size) avisar("Primero agregá algo rico a la canasta.");
    else avisar("¡Muy pronto vas a poder enviar tu pedido por WhatsApp!");
  });

  // La barrita de celular se esconde cuando la canasta ya está a la vista.
  if (barra && "IntersectionObserver" in window) {
    new IntersectionObserver(([entrada]) => {
      barra.classList.toggle("canasta-visible", entrada.isIntersecting);
    }).observe($("#canasta"));
  }

  /* ---------- Arranque ---------- */

  cargar();
  armarEstanteria();
  for (const [id, n] of pedido) for (let i = 0; i < n; i++) sumarAPila(id, false);
  actualizar();
  iniciarArrastre();

  // Viene del menú con un producto elegido: pedido.html?agregar=budines
  const elegido = new URLSearchParams(location.search).get("agregar");
  if (elegido && porId.has(elegido)) {
    history.replaceState(null, "", location.pathname + location.hash);
    setTimeout(() => agregar(elegido, { caer: true }), 400);
  }
})();
