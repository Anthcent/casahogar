# Casa Hogar

Sitio editorial de un liceo, construido con React y Vite. Incluye portada, blog, artículos y galería; funciona en temas claro y oscuro.

## Ejecutar

Requiere Node.js 20 o superior.

```sh
npm install
npm run dev
```

Abre la URL indicada por Vite. Para verificar versión de producción:

```sh
npm run build
npm run preview
```

## Publicar en Vercel

1. Importa repositorio `Anthcent/casahogar` en Vercel.
2. Selecciona preset **Vite**; comando de build `npm run build` y directorio de salida `dist`.
3. Publica. No se necesitan variables de entorno para esta demostración.

Rutas usan hash (`#/blog`, `#/articulo/convivencia`, `#/galeria`), así que navegación directa funciona sin reglas de redirección del servidor.

## Contenido

- `src/data/content.js`: historias, titulares, imágenes y textos alternativos.
- `src/data/editorial.js`: cuerpos de artículos de muestra.
- `src/pages/EditorialPages.jsx`: blog con filtros y búsqueda, lectura de artículos y galería con visor.
- `src/styles/style.css` y `src/styles/editorial.css`: temas y diseño adaptable.

Textos y fotografías de Unsplash son **ilustrativos**: no representan hechos, estudiantes ni instalaciones reales de Casa Hogar. Sustituye contenido antes de publicar noticias oficiales. Formulario de suscripción, enlaces sociales y reproductor audiovisual son demostrativos; requieren servicios y URLs reales.

`vista-previa.html` es una demostración local independiente de la portada. Para revisar blog, artículos y galería, usa aplicación Vite.
