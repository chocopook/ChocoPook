/*
 * Chocopook · Datos editables
 * ---------------------------------------------------------
 * Este es el único archivo que hace falta tocar para cambiar
 * redes, el video de la receta del día o los productos del pedido.
 * Si un dato queda vacío (""), el sitio muestra "¡Muy pronto!"
 * en lugar de un link roto.
 */
window.CHOCOPOOK_CONFIG = {
  // Usuario de Instagram, sin @.
  instagramUsuario: "_chocopook",

  // Número de WhatsApp con código de país y área, sin + ni espacios (+54 9 11 3884-7362).
  whatsappNumero: "5491138847362",

  // Mensajes con los que se abre el chat de WhatsApp, según desde dónde se toque.
  // Los links usan "consulta"; uno puede pedir otro con data-mensaje="<clave>".
  whatsappMensajes: {
    // íconos de WhatsApp de la barra y del pie
    consulta: "¡Hola Chocopook! 😊 Quería hacerles una consulta",
    // encabeza el pedido armado en pedido.html (abajo va la lista de productos)
    pedido: "¡Hola Chocopook! Quiero hacer un pedido",
  },

  // Canal de YouTube (íconos de la barra y del pie).
  youtubeCanal: "https://www.youtube.com/channel/UC5Ds7IoiO4v8Iz-b3Fk7sYQ",

  // Receta del día: link de YouTube (watch, youtu.be o shorts) o solo el ID.
  recetaDelDia: {
    titulo: "Torta de crema estilo Cry Baby",
    youtube: "https://www.youtube.com/shorts/4wmpPvNakN0",
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
    { id: "tartas-frutales", nombre: "Tartas frutales", tipo: "dulce" },
    { id: "masas-finas", nombre: "Masas finas", tipo: "dulce" },
    { id: "tortas-materas", nombre: "Tortas materas", tipo: "dulce" },
    { id: "cupcakes", nombre: "Cupcakes", tipo: "dulce" },
    { id: "box-matero", nombre: "Box matero", tipo: "dulce" },
    { id: "flan", nombre: "Flan", tipo: "dulce" },
    { id: "chaja", nombre: "Chajá", tipo: "dulce" },
    { id: "pastafrola", nombre: "Pastafrola", tipo: "dulce" },
    { id: "pionono", nombre: "Pionono", tipo: "dulce" },
    { id: "sorrentinos", nombre: "Sorrentinos", tipo: "salado" },
    { id: "empanadas", nombre: "Empanadas", tipo: "salado" },
    { id: "tartas-saladas", nombre: "Tartas saladas", tipo: "salado" },
    { id: "chipa", nombre: "Chipá", tipo: "salado" },
    { id: "pastas", nombre: "Pastas", tipo: "salado" },
    { id: "pizzetas", nombre: "Pizzetas", tipo: "salado" },
    { id: "pizzas-congeladas", nombre: "Pizzas congeladas", tipo: "salado" },
    { id: "sandwiches-de-miga", nombre: "Sándwiches de miga", tipo: "salado" },
    { id: "pebetes", nombre: "Pebetes", tipo: "salado" },
    { id: "chips", nombre: "Chips", tipo: "salado" },
    { id: "pan-de-molde", nombre: "Pan de molde", tipo: "salado" },
    { id: "bizcochos-de-grasa", nombre: "Bizcochos de grasa", tipo: "salado" },
  ],
};
