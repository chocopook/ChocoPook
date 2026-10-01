/*
 * Chocopook · Datos editables
 * ---------------------------------------------------------
 * Este es el único archivo que hace falta tocar para cambiar
 * redes, el video de la receta del día o los productos del pedido.
 * Si un dato queda vacío (""), el sitio muestra "¡Muy pronto!"
 * en lugar de un link roto.
 */
window.CHOCOPOOK_CONFIG = {
  // Usuario de Instagram, sin @. Ej: "chocopook"  (PENDIENTE)
  instagramUsuario: "",

  // Número de WhatsApp con código de país y área, sin + ni espacios.
  // Ej: "5491112345678"  (PENDIENTE)
  whatsappNumero: "",

  // Mensaje con el que se abre el chat de WhatsApp (también encabeza el pedido).
  whatsappMensaje: "¡Hola Chocopook! Quiero hacer un pedido",

  // Receta del día: link de YouTube (watch, youtu.be o shorts) o solo el ID.
  recetaDelDia: {
    titulo: "Cookies de chocolate",
    youtube: "", // PENDIENTE
  },

  // Productos de la página "Armá tu pedido" (pedido.html).
  // - id: nombre del dibujo en assets/svg/productos/<id>.svg y lo que usan los
  //   links del menú (pedido.html?agregar=<id>).
  // - tipo: "dulce" o "salado" (en qué estante aparece).
  // Si se agrega o cambia un producto, actualizar también el libro del menú en index.html.
  productos: [
    { id: "budines", nombre: "Budines", tipo: "dulce" },
    { id: "cookies", nombre: "Cookies", tipo: "dulce" },
    { id: "alfajores", nombre: "Alfajores", tipo: "dulce" },
    { id: "tartas", nombre: "Tartas", tipo: "dulce" },
    { id: "masas-finas", nombre: "Masas finas", tipo: "dulce" },
    { id: "tortas-materas", nombre: "Tortas materas", tipo: "dulce" },
    { id: "cupcakes", nombre: "Cupcakes", tipo: "dulce" },
    { id: "sorrentinos", nombre: "Sorrentinos", tipo: "salado" },
    { id: "empanadas", nombre: "Empanadas", tipo: "salado" },
    { id: "tartas-saladas", nombre: "Tartas saladas", tipo: "salado" },
    { id: "chipa", nombre: "Chipá", tipo: "salado" },
    { id: "pastas", nombre: "Pastas", tipo: "salado" },
    { id: "minipizzas", nombre: "Minipizzas", tipo: "salado" },
  ],
};
