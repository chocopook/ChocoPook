/*
 * Chocopook · Datos editables
 * ---------------------------------------------------------
 * Este es el único archivo que hace falta tocar para cambiar
 * redes, el video de la receta del día o los links del menú.
 * Si un dato queda vacío (""), el sitio muestra "¡Muy pronto!"
 * en lugar de un link roto.
 */
window.CHOCOPOOK_CONFIG = {
  // Usuario de Instagram, sin @. Ej: "chocopook"  (PENDIENTE)
  instagramUsuario: "",

  // Número de WhatsApp con código de país y área, sin + ni espacios.
  // Ej: "5491112345678"  (PENDIENTE)
  whatsappNumero: "",

  // Mensaje con el que se abre el chat de WhatsApp.
  whatsappMensaje: "¡Hola Chocopook! Quiero hacer un pedido",

  // Receta del día: link de YouTube (watch, youtu.be o shorts) o solo el ID.
  recetaDelDia: {
    titulo: "Cookies de chocolate",
    youtube: "", // PENDIENTE
  },

  // Link al post de cada receta del menú (Instagram, blog, etc.).
  recetas: {
    // Menú dulce
    budines: "",
    cookies: "",
    alfajores: "",
    tartas: "",
    "masas-finas": "",
    "porciones-de-torta": "",
    cupcakes: "",
    // Menú salado
    sorrentinos: "",
    empanadas: "",
    "tartas-saladas": "",
    chipa: "",
    "bastones-de-queso": "",
    minipizzas: "",
  },
};
