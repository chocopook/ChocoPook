# Chocopook · Pastelería

Sitio web de **Chocopook**, pastelería artesanal hecha con amor en Los Toldos, Argentina.

Es una web estática (HTML + CSS + JavaScript, sin paso de compilación) pensada para publicarse en **GitHub Pages**.

## Secciones

1. **Portada**: logo del oso pastelero y mensaje de bienvenida.
2. **Menú**: mantel cuadrillé con un libro abierto (Menú Dulce / Menú Salado). Cada ítem abre "Armá tu pedido" con ese producto ya en la canasta. Abajo, los botones de Instagram y de pedidos.
3. **Nuestras recetas**: toldo de local, vitrina con la galería de fotos y mostrador de madera.
4. **Receta del día**: video de YouTube.

Y una página aparte, **Armá tu pedido** (`pedido.html`): una estantería con los productos dibujados (con un filtro Dulce / Salado) que se arrastran (o se tocan) hasta una canasta, un ticket con las cantidades y un botón que abre WhatsApp con el pedido escrito. Los productos no tienen precio: eso se coordina por WhatsApp. El pedido queda guardado en el navegador de quien lo arma.

## Ver el sitio en local

No hace falta instalar nada. Con XAMPP prendido (Apache), entrá a:

```
http://localhost/ChocoPook/
```

También sirve cualquier servidor estático apuntando a esta carpeta. Si abrís `index.html` con doble clic (`file://`), la mayor parte se ve igual, pero el video de YouTube necesita servirse por `http`.

## Datos que se editan seguido

Todo lo que cambia con frecuencia está en [`js/config.js`](js/config.js), así no hace falta tocar el HTML:

| Dato | Clave | Ejemplo |
| --- | --- | --- |
| Usuario de Instagram | `instagramUsuario` | `"_chocopook"` |
| Número de WhatsApp | `whatsappNumero` | `"5491138847362"` (código de país + área, sin `+` ni espacios) |
| Mensaje de los íconos de WhatsApp | `whatsappMensajes.consulta` | `"¡Hola Chocopook! 😊 Quería hacerles una consulta"` |
| Encabezado del pedido por WhatsApp | `whatsappMensajes.pedido` | `"¡Hola Chocopook! Quiero hacer un pedido"` |
| Canal de YouTube | `youtubeCanal` | link del canal |
| Video de la receta del día | `recetaDelDia.youtube` | link completo de YouTube (watch, youtu.be o shorts) o solo el ID |
| Nombre de la receta del día | `recetaDelDia.titulo` | `"Torta de crema estilo Cry Baby"` |
| Productos del pedido | `productos` | `{ id: "cookies", nombre: "Cookies", tipo: "dulce" }` |

Mientras un dato esté vacío, el sitio muestra un aviso de "¡Muy pronto!" en lugar de un link roto. El botón "Hacer pedido por WhatsApp" funciona apenas se cargue `whatsappNumero`.

Para sumar un producto: agregalo a `productos`, poné su dibujo en `assets/svg/productos/<id>.svg` (100 × 100) y su ítem en el libro del menú de `index.html` (`pedido.html?agregar=<id>`).

Las fotos de la galería están en `assets/img/galeria/` (WebP de hasta 1400 px de lado). Para sumar una: guardá la foto ahí y, en `index.html`, copiá un `<li>` de la galería cambiando la imagen, el `alt` y el nombre. Sirve cualquier tamaño: el marco la encuadra solo. Las fotos se leen de a columnas (1.ª arriba, 2.ª abajo…) y las flechas aparecen solas cuando hay más de las que entran.

## Estructura

```
index.html            Página principal con las 4 secciones
pedido.html           Armá tu pedido (estantería, canasta y ticket)
css/                  Estilos, un archivo por módulo (base, nav, portada, menu, local, receta, pie, pedido, cursor)
js/config.js          Datos editables (redes, video, productos)
js/main.js            Comportamiento común: menú móvil, links, video, visor de fotos
js/pedido.js          Armá tu pedido: arrastrar, canasta, ticket y mensaje de WhatsApp
js/cursor.js          Cursor estrella: animación al pasar por links y botones, y estela
assets/svg/           Ilustraciones propias (oso, libro, canasta, toldo, plantas, garabatos, etc.)
assets/svg/productos/ Un dibujo por producto del pedido
assets/cursor/        Estrella pixel art del cursor
assets/img/galeria/   Fotos de la vitrina
```

## Publicación en GitHub Pages (pendiente)

El sitio va a vivir en una cuenta de GitHub propia de la pastelería, que **todavía no está definida** (probablemente "ChocoPook").

- [ ] Crear o definir la cuenta y el usuario de GitHub de Chocopook.
- [ ] Subir o transferir este repositorio a esa cuenta.
- [ ] En el repo: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`**.
- [ ] Verificar la URL publicada: `https://<usuario>.github.io/<repositorio>/` (o `https://<usuario>.github.io/` si el repo se llama `<usuario>.github.io`).
- [ ] (Opcional) Dominio propio: agregar un archivo `CNAME` y configurar el DNS.

Todas las rutas del sitio son relativas, así que funciona igual en una subcarpeta de GitHub Pages, en un dominio propio o en XAMPP. El archivo `.nojekyll` evita que GitHub Pages procese el sitio con Jekyll.

## Pendientes de contenido

Ninguno: Instagram, WhatsApp, YouTube y el video de la receta del día ya están cargados en `js/config.js`.
