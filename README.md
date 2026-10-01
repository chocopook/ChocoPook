# Chocopook · Pastelería

Sitio web de **Chocopook**, pastelería artesanal hecha con amor en Buenos Aires, Argentina.

Es una web estática (HTML + CSS + JavaScript, sin paso de compilación) pensada para publicarse en **GitHub Pages**.

![Diseño de referencia](docs/diseno-referencia.jpg)

## Secciones

1. **Portada**: logo del oso pastelero y mensaje de bienvenida.
2. **Menú**: mantel cuadrillé con un libro abierto (Menú Dulce / Menú Salado) cuyos ítems llevan a los posts de recetas, más los botones de Instagram y WhatsApp.
3. **Nuestras recetas**: toldo de local, vitrina con la galería de fotos y mostrador de madera.
4. **Receta del día**: video de YouTube.

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
| Usuario de Instagram | `instagramUsuario` | `"chocopook"` |
| Número de WhatsApp | `whatsappNumero` | `"5491112345678"` (código de país + área, sin `+` ni espacios) |
| Mensaje inicial de WhatsApp | `whatsappMensaje` | `"¡Hola Chocopook! Quiero hacer un pedido"` |
| Video de la receta del día | `recetaDelDia.youtube` | link completo de YouTube o solo el ID |
| Nombre de la receta del día | `recetaDelDia.titulo` | `"Cookies de chocolate"` |
| Links de cada ítem del menú | `recetas.<clave>` | link al post de la receta |

Mientras un dato esté vacío, el sitio muestra un aviso de "¡Muy pronto!" en lugar de un link roto.

Las fotos de la galería están en `assets/img/galeria/`. Hoy son ilustraciones provisorias en SVG: para cambiarlas por fotos reales, subí la foto (`.jpg` o `.webp`, idealmente 1200×900) y actualizá el `src` en `index.html`.

## Estructura

```
index.html            Página única con las 4 secciones
css/                  Estilos, un archivo por módulo (base, nav, portada, menu, local, pie)
js/config.js          Datos editables (redes, video, links de recetas)
js/main.js            Comportamiento: menú móvil, links, video, visor de fotos
assets/svg/           Ilustraciones propias (oso, cupcake, toldo, garabatos, etc.)
assets/img/galeria/   Fotos de la vitrina
docs/                 Diseño de referencia
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

- [ ] Usuario de Instagram.
- [ ] Número de WhatsApp para pedidos.
- [ ] Video de la receta del día.
- [ ] Links a los posts de cada receta del menú.
- [ ] Fotos reales para la galería.
