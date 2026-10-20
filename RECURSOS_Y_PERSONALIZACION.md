# Personalizar Casa Hogar

## Sustituir imágenes

1. Coloca archivos WebP, PNG o JPG en `public/assets/`.
2. Cambia URL correspondiente en `ASSETS` dentro de `src/data/content.js` por `/assets/nombre.webp`.
3. Ajusta texto alternativo en `IMAGE_ALTS` para describir fotografía real.

Los contenedores ajustan imágenes con `object-fit: cover`. Si cambias fotografía de portada, revisa encuadre `.hero-image` en `src/styles/style.css` para escritorio y móvil.

| Clave | Uso |
|---|---|
| `hero` | Banner principal |
| `featuredService`, `faithSociety`, `innovation` | Historias destacadas |
| `articleAI`, `articleTestimony`, `articleSolidarity`, `articleOpinion` | Blog y artículos |
| `faithImage`, `storyFaith` | Tarjetas con imágenes religiosas |
| `campus` | Vida escolar |
| `gallery1` a `gallery5` | Galería y visor |
| `podcast` | Voces del liceo |
| `reading1` a `reading4` | Lecturas recomendadas |

Actualmente imágenes de Unsplash necesitan conexión a Internet. Archivo local `public/assets/portada-estudiantes.webp` sigue disponible como recurso histórico, pero banner actual usa foto ilustrativa externa.

## Sustituir contenido

Edita titulares, eventos y categorías en `src/data/content.js`. Escribe artículos completos en `src/data/editorial.js` usando mismo `id` que cada artículo en `content.js`. Páginas se abren mediante `#/articulo/id`.

Antes de difundir noticias oficiales, reemplaza textos de muestra y confirma fechas, autorías, imágenes y enlaces sociales. Formulario de suscripción necesita servicio de registro y se encuentra en `src/App.jsx`.

## Tema y vista previa

Variables de temas claro y oscuro: `src/styles/style.css`. Estilos de páginas editoriales: `src/styles/editorial.css`. Tema se guarda en `localStorage`.

`vista-previa.html` y `preview/` son vista independiente de portada: si actualizas contenido visual allí, sincroniza sus archivos con aplicación principal. Blog y galería se prueban con `npm run dev`.
