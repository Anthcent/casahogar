const { useState, useEffect, useMemo, useRef } = React;
// Fotografías ilustrativas de Unsplash; no representan alumnos ni instalaciones de Casa Hogar.
const photo = (id, width = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
const ASSETS = {
    hero: photo('1759143102544-790af882ff45', 1600),
    featuredService: photo('1719159381916-062fa9f435a6', 1000),
    faithSociety: photo('1737567427481-543c88189b2e', 600),
    innovation: photo('1509062522246-3755977927d7', 600),
    faithImage: photo('1684885764692-605184b79c60', 700),
    storyFaith: photo('1593112038426-b759c7cbc0ad', 500),
    campus: photo('1746937107789-895b1d2f5c3a', 900),
    gallery1: photo('1734542380831-1b843c852c5e', 800),
    gallery2: photo('1637148602945-433108982492', 500),
    gallery3: photo('1637195141546-2469a5312504', 500),
    gallery4: photo('1737567427481-543c88189b2e', 500),
    gallery5: photo('1719159381962-4170890ada4e', 500),
    podcast: photo('1590602846989-e99596d2a6ee', 750),
    articleAI: photo('1637195141546-2469a5312504', 500),
    articleTestimony: photo('1637148602945-433108982492', 500),
    articleSolidarity: photo('1737567427481-543c88189b2e', 500),
    articleOpinion: photo('1593724382028-100d4e0d180d', 500),
    reading1: photo('1532294220147-279399e4e00f', 400),
    reading2: photo('1698620625528-be04786c9081', 400),
    reading3: photo('1593724382028-100d4e0d180d', 400),
    reading4: photo('1740635341299-3b8e3490f546', 400),
};
const IMAGE_ALTS = {
    featuredService: 'Estudiantes trabajando en un aula, fotografía ilustrativa',
    faithSociety: 'Niños compartiendo una actividad escolar, fotografía ilustrativa',
    innovation: 'Docente y estudiantes reunidos en clase, fotografía ilustrativa',
    faithImage: 'Crucifijo frente a un vitral de iglesia, fotografía ilustrativa',
    storyFaith: 'Vitral de iglesia con cruz, fotografía ilustrativa',
    campus: 'Estudiantes caminando junto a un campo deportivo, fotografía ilustrativa',
    gallery1: 'Grupo de estudiantes en un salón de clases, fotografía ilustrativa',
    gallery2: 'Estudiantes sentados durante una clase, fotografía ilustrativa',
    gallery3: 'Niño realizando una actividad artística, fotografía ilustrativa',
    gallery4: 'Estudiantes compartiendo una actividad, fotografía ilustrativa',
    gallery5: 'Salón de clases con pupitres, fotografía ilustrativa',
    podcast: 'Micrófono de grabación en un estudio, fotografía ilustrativa',
    articleAI: 'Actividad de pintura con materiales escolares, fotografía ilustrativa',
    articleTestimony: 'Estudiantes compartiendo en clase, fotografía ilustrativa',
    articleSolidarity: 'Niños realizando una actividad juntos, fotografía ilustrativa',
    articleOpinion: 'Lectura en una biblioteca, fotografía ilustrativa',
    reading1: 'Persona leyendo entre estantes de libros, fotografía ilustrativa',
    reading2: 'Estantes de una biblioteca, fotografía ilustrativa',
    reading3: 'Persona leyendo en una biblioteca, fotografía ilustrativa',
    reading4: 'Salón de clases con libros, fotografía ilustrativa',
};
const heroSlides = [
    { eyebrow: 'APRENDER, CONVIVIR, CRECER', lines: ['Jóvenes', 'que', 'el mañana'], highlight: 'iluminan', description: 'Un espacio para descubrir lo que sucede en las aulas, compartir experiencias y acompañar cada etapa de la vida escolar.', tag: 'VIDA ESCOLAR' },
    { eyebrow: 'APRENDIZAJE EN ACCIÓN', lines: ['Ideas que nacen', 'en el aula', 'y van más allá'], highlight: '', description: 'Proyectos, preguntas y actividades que invitan a aprender con curiosidad y trabajar en equipo.', tag: 'APRENDIZAJE' },
    { eyebrow: 'NUESTRA COMUNIDAD', lines: ['Cada historia', 'tiene un lugar', 'aquí'], highlight: '', description: 'Estudiantes, docentes y familias construyen juntos la experiencia de nuestro liceo.', tag: 'COMUNIDAD' },
];
const ticker = [
    'Vida escolar  ·  Conoce las actividades de nuestra comunidad',
    'Aprendizaje  ·  Proyectos y experiencias dentro del aula',
    'Comunidad  ·  Espacios para estudiantes y familias',
    'Cultura  ·  Arte, lectura y expresión en el liceo',
];
const filters = [
    { id: 'all', label: 'Todo', icon: 'sparkles' },
    { id: 'faith', label: 'Formación', icon: 'church' },
    { id: 'campus', label: 'Vida escolar', icon: 'graduation' },
    { id: 'science', label: 'Ciencia y arte', icon: 'camera' },
    { id: 'social', label: 'Comunidad', icon: 'heart' },
    { id: 'testimonies', label: 'Voces', icon: 'users' },
    { id: 'opinion', label: 'Ideas', icon: 'chat' },
    { id: 'media', label: 'Multimedia', icon: 'video' }
];
const articles = [
    { id: 'solidaridad', category: 'VIDA ESCOLAR', filter: 'campus', title: 'Aprender juntos también ocurre fuera del aula', excerpt: 'El recreo, los proyectos compartidos y las actividades del liceo son parte de una experiencia escolar que se construye entre todos.', date: 'Vida escolar', read: '5 min de lectura', author: 'Comunidad educativa', image: 'featuredService', type: 'featured' },
    { id: 'fe-dialogo', category: 'FORMACIÓN', filter: 'faith', title: 'Crecer con respeto, diálogo y confianza', excerpt: 'Acompañar a cada estudiante implica escuchar, conversar y aprender a convivir.', date: 'Formación', read: '4 min', image: 'faithSociety', type: 'side' },
    { id: 'innovacion', category: 'VIDA ESCOLAR', filter: 'campus', title: 'Proyectos que conectan el aula con el mundo', excerpt: 'Una invitación a explorar ideas y poner en práctica lo aprendido.', date: 'Vida escolar', read: '3 min', image: 'innovation', type: 'side' },
    { id: 'inteligencia-artificial', category: 'CIENCIA Y ARTE', filter: 'science', title: 'La curiosidad es el punto de partida', excerpt: 'Preguntar, experimentar y crear abre nuevas formas de aprender.', date: 'Aprendizaje', read: '4 min', image: 'articleAI' },
    { id: 'experiencia', category: 'VOCES', filter: 'testimonies', title: 'Lo que aprendemos al compartir', excerpt: 'Una mirada a las amistades y experiencias que acompañan la etapa escolar.', date: 'Vida escolar', read: '6 min', image: 'articleTestimony' },
    { id: 'pequenas-acciones', category: 'COMUNIDAD', filter: 'social', title: 'Pequeños gestos que construyen comunidad', excerpt: 'La colaboración cotidiana también forma parte de la educación.', date: 'Comunidad', read: '3 min', image: 'articleSolidarity' },
    { id: 'lider', category: 'IDEAS', filter: 'opinion', title: 'Escuchar otras ideas nos ayuda a crecer', excerpt: 'El diálogo y el pensamiento propio tienen lugar dentro y fuera del aula.', date: 'Ideas', read: '5 min', image: 'articleOpinion' },
];
const events = [
    { day: '01', month: 'PRÓX.', title: 'Actividades del liceo', place: 'Por confirmar', time: 'Por confirmar' },
    { day: '02', month: 'PRÓX.', title: 'Encuentros con familias', place: 'Por confirmar', time: 'Por confirmar' },
    { day: '03', month: 'PRÓX.', title: 'Talleres y proyectos', place: 'Por confirmar', time: 'Por confirmar' }
];
const podcasts = [
    { title: 'Conversaciones de nuestra comunidad', time: 'Próximamente' },
    { title: 'Aprender dentro y fuera del aula', time: 'Próximamente' },
    { title: 'Historias del liceo', time: 'Próximamente' },
];
const campusLinks = [
    { title: 'Aprender también es compartir', date: 'Vida escolar', image: 'gallery2' },
    { title: 'Deporte, juego y trabajo en equipo', date: 'Actividades', image: 'campus' },
    { title: 'Arte y creatividad en el aula', date: 'Proyectos', image: 'gallery3' },
];
const readings = [
    { category: 'LECTURA', name: 'Historias para descubrir', author: 'Selección del liceo', image: 'reading1' },
    { category: 'APRENDIZAJE', name: 'Preguntas para seguir explorando', author: 'Selección del liceo', image: 'reading2' },
    { category: 'CONVIVENCIA', name: 'Aprender a vivir juntos', author: 'Selección del liceo', image: 'reading3' },
    { category: 'CREATIVIDAD', name: 'Ideas para imaginar y crear', author: 'Selección del liceo', image: 'reading4' }
];
const icons = { sparkles: Grid2X2, church: NotebookPen, graduation: School, camera: Shapes, heart: UsersRound, users: MessageSquareQuote, chat: Lightbulb, video: Clapperboard };
const navItems = [['Inicio', '#inicio'], ['El liceo', '#historias'], ['Vida escolar', '#vida-escolar'], ['Aprendizaje', '#publicaciones'], ['Comunidad', '#historias'], ['Galería', '#galeria'], ['Lecturas', '#lecturas']];
function Brand({ footer = false, goHome = true }) {
    return React.createElement("a", { className: 'brand ' + (footer ? 'brand-footer' : ''), href: goHome ? '#inicio' : '#footer', "aria-label": "Casa Hogar — Inicio" },
        React.createElement(House, { className: "brand-icon", size: 29, strokeWidth: 1.8 }),
        React.createElement("span", { className: "brand-word" }, "Casa Hogar"),
        !footer && React.createElement("span", { className: "brand-tagline" },
            "Aprender juntos,",
            React.createElement("br", null),
            "crecer en comunidad"),
        footer && React.createElement("span", { className: "footer-tagline" },
            "Un espacio para aprender",
            React.createElement("br", null),
            "y crecer juntos"));
}
function Slot({ asset, className = '', compact = false, children, label = 'Imagen pendiente' }) {
    const url = ASSETS[asset];
    return React.createElement("div", { className: 'slot ' + (compact ? 'slot-compact ' : '') + className },
        React.createElement("div", { className: "slot-placeholder", "aria-hidden": url ? "true" : undefined, role: url ? undefined : "img", "aria-label": url ? undefined : label },
            React.createElement("svg", { className: "mountain-glyph", viewBox: "0 0 100 72", fill: "none", "aria-hidden": "true" },
                React.createElement("circle", { cx: "69", cy: "19", r: "7", fill: "currentColor", opacity: ".48" }),
                React.createElement("path", { d: "M4 64L35 24 51 45 63 32 96 64H4z", fill: "currentColor", opacity: ".36" }),
                React.createElement("path", { d: "M4 64L20 44 37 64H4z", fill: "currentColor", opacity: ".22" }))),
        url && React.createElement("img", { className: "slot-image", src: url, alt: IMAGE_ALTS[asset] || label, loading: "lazy" }),
        children);
}
function Eyebrow({ children, color = 'yellow' }) { return React.createElement("span", { className: 'eyebrow eyebrow-' + color }, children); }
function SectionHeading({ title, action = 'Ver todas', onClick }) {
    return React.createElement("div", { className: "section-heading" },
        React.createElement("div", { className: "heading-title" },
            React.createElement("h2", null, title)),
        React.createElement("button", { className: "more-link", type: "button", onClick: onClick, "aria-label": action },
            React.createElement("span", null, action),
            React.createElement(ArrowRight, { size: 14 })),
        React.createElement("span", { className: "heading-divider", "aria-hidden": "true" }));
}
function Header({ theme, onTheme, toggleSearch, searchOpen, search, setSearch, searchResults, onArticle }) {
    const [mobileMenu, setMobileMenu] = useState(false);
    return React.createElement(React.Fragment, null,
        React.createElement("header", { className: "topbar", id: "inicio" },
            React.createElement("div", { className: "topbar-inner page-shell" },
                React.createElement(Brand, null),
                React.createElement("nav", { className: 'main-nav ' + (mobileMenu ? 'nav-open' : ''), "aria-label": "Navegaci\u00F3n principal" }, navItems.map(([label, href], i) => React.createElement("a", { onClick: () => setMobileMenu(false), className: i === 0 ? 'selected' : '', href: href, key: label }, label))),
                React.createElement("div", { className: "top-actions" },
                    React.createElement("div", { className: "search-field" },
                        React.createElement(Search, { size: 15 }),
                        React.createElement("input", { "aria-label": "Buscar art\u00EDculos y temas", placeholder: "Buscar art\u00EDculos, temas...", value: search, onChange: e => setSearch(e.target.value), onFocus: () => toggleSearch(true), onKeyDown: e => e.key === 'Escape' && toggleSearch(false) }),
                        React.createElement("button", { className: "search-trigger", "aria-label": "Buscar", onClick: () => toggleSearch(!searchOpen) },
                            React.createElement(Search, { size: 18 }))),
                    React.createElement("button", { className: "theme-toggle", onClick: onTheme, title: theme === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro', "aria-label": "Cambiar tema" }, theme === 'dark' ? React.createElement(Sun, { size: 17 }) : React.createElement(Moon, { size: 17 })),
                    React.createElement("button", { className: "menu-toggle", onClick: () => setMobileMenu(s => !s), "aria-label": mobileMenu ? 'Cerrar menú' : 'Abrir menú' }, mobileMenu ? React.createElement(X, { size: 22 }) : React.createElement(Menu, { size: 22 }))))),
        searchOpen && React.createElement("div", { className: "search-results", role: "dialog", "aria-label": "Resultados de b\u00FAsqueda" },
            React.createElement("div", { className: "search-results-top" },
                React.createElement("strong", null, "Buscar en Casa Hogar"),
                React.createElement("button", { onClick: () => toggleSearch(false), "aria-label": "Cerrar b\u00FAsqueda" },
                    React.createElement(X, { size: 17 }))),
            search.trim() ? (searchResults.length ? searchResults.map(a => React.createElement("button", { className: "search-result-item", key: a.id, onClick: () => { onArticle(a); toggleSearch(false); } },
                React.createElement("span", null, a.category),
                a.title,
                React.createElement(ArrowRight, { size: 14 }))) : React.createElement("p", null,
                "No se encontraron resultados para \u00AB",
                search,
                "\u00BB.")) : React.createElement("p", null, "Escribe una palabra clave para buscar entre los art\u00EDculos de demostraci\u00F3n.")));
}
function Ticker() {
    return React.createElement("div", { className: "news-ticker", role: "region", "aria-label": "Noticias de Casa Hogar" },
        React.createElement("div", { className: "page-shell ticker-inner" },
            React.createElement("span", { className: "ticker-label" }, "EN CASA HOGAR"),
            React.createElement("div", { className: "ticker-window", tabIndex: 0, role: "group", "aria-label": "Titulares; desplaza horizontalmente para leerlos" },
                React.createElement("div", { className: "ticker-marquee" },
                    React.createElement("div", { className: "ticker-group" }, ticker.map((headline, index) => React.createElement("span", { className: "ticker-headline", key: index }, headline))),
                    React.createElement("div", { className: "ticker-group", "aria-hidden": "true" }, ticker.map((headline, index) => React.createElement("span", { className: "ticker-headline", key: index }, headline)))))));
}
function Hero({ onArticle, onVideo }) {
    const [idx, setIdx] = useState(0);
    const s = heroSlides[idx];
    return React.createElement("section", { className: "hero", "aria-label": "Historia principal" },
        React.createElement("div", { className: "hero-image", style: { backgroundImage: `url('${ASSETS.hero}')` } }),
        React.createElement("div", { className: "hero-scrim" }),
        React.createElement("div", { className: "hero-side-texture" }),
        React.createElement("div", { className: "hero-left-swoosh", "aria-hidden": "true" },
            React.createElement("svg", { viewBox: "0 0 90 180" },
                React.createElement("path", { d: "M-14 85c25-4 37 22 83 29M-6 107c29-9 38 16 78 18M-6 131c25-11 36 6 66 11", fill: "none", stroke: "#ffc915", strokeWidth: "9", strokeLinecap: "round" }))),
        React.createElement("div", { className: "hero-copy page-shell" },
            React.createElement("div", { className: "hero-copy-inner" },
                React.createElement("p", { className: "hero-eyebrow" }, s.eyebrow),
                React.createElement("h1", null, idx === 0 ? React.createElement(React.Fragment, null,
                    "J\u00F3venes",
                    React.createElement("br", null),
                    "que ",
                    React.createElement("span", null, "iluminan"),
                    React.createElement("br", null),
                    "el ma\u00F1ana") : s.lines.map((line, i) => React.createElement(React.Fragment, { key: line },
                    line,
                    i !== s.lines.length - 1 && React.createElement("br", null)))),
                React.createElement("p", { className: "hero-description" }, s.description),
                React.createElement("div", { className: "hero-buttons" },
                    React.createElement("button", { className: "primary-btn", onClick: () => onArticle({ id: 'hero', category: s.tag, title: idx === 0 ? 'Jóvenes que iluminan el mañana' : s.lines.join(' '), excerpt: s.description }) },
                        "Conoce nuestra comunidad ",
                        React.createElement(ArrowRight, { size: 16 })),
                    React.createElement("button", { className: "video-hero", onClick: () => onVideo('Voces de Casa Hogar') },
                        React.createElement("span", { className: "play-outline" },
                            React.createElement(Play, { size: 13, fill: "currentColor" })),
                        React.createElement("span", null,
                            "Voces del liceo",
                            React.createElement("small", null, "1:48 min")))))),
        React.createElement("div", { className: "hero-handwriting" },
            "Mentes",
            React.createElement("br", null),
            "preparadas.",
            React.createElement("br", null),
            "Corazones",
            React.createElement("br", null),
            "dispuestos.",
            React.createElement("br", null),
            "Un mundo",
            React.createElement("br", null),
            "mejor.",
            React.createElement("i", { "aria-hidden": "true" })),
        React.createElement("div", { className: "hero-mark hero-mark-one", "aria-hidden": "true" }, "\u2733"),
        React.createElement("div", { className: "hero-mark hero-mark-two", "aria-hidden": "true" }, "\u3030"),
        React.createElement("div", { className: "hero-pager", "aria-label": "Cambiar historia principal" },
            heroSlides.map((s, i) => React.createElement("button", { key: i, className: idx === i ? 'active' : '', onClick: () => setIdx(i), "aria-label": 'Historia ' + (i + 1) },
                "0",
                i + 1)),
            React.createElement("button", { "aria-label": "Siguiente historia", onClick: () => setIdx(i => (i + 1) % heroSlides.length) },
                React.createElement(ArrowRight, { size: 15 }))));
}
function FilterNav({ selected, onSelect }) { return React.createElement("div", { className: "filters" },
    React.createElement("div", { className: "page-shell filters-scroll" }, filters.map(f => { const Icon = icons[f.icon]; return React.createElement("button", { key: f.id, className: 'filter-btn ' + (selected === f.id ? 'active' : ''), onClick: () => onSelect(f.id), "aria-pressed": selected === f.id },
        React.createElement(Icon, { size: 18 }),
        React.createElement("span", null, f.label)); }))); }
function FeatureCard({ article, onArticle, variant = 'large' }) {
    const large = variant === 'large';
    return React.createElement("button", { className: 'feature-card feature-' + variant, onClick: () => onArticle(article) },
        React.createElement(Slot, { asset: article.image, className: "feature-photo", label: 'Imagen pendiente: ' + article.title },
            large && React.createElement("div", { className: "feature-gradient" }),
            React.createElement("div", { className: "feature-body" },
                React.createElement(Eyebrow, null, article.category),
                React.createElement("h3", null, article.title),
                large && React.createElement("p", null, article.excerpt),
                React.createElement("div", { className: "feature-meta" }, large ? React.createElement(React.Fragment, null,
                    React.createElement(CircleUserRound, { size: 17 }),
                    " Por ",
                    article.author,
                    " ",
                    React.createElement("span", { className: "meta-divider" }, "|"),
                    " ",
                    article.date,
                    " ",
                    React.createElement("span", { className: "meta-divider" }, "|"),
                    " ",
                    React.createElement(Clock3, { size: 12 }),
                    " ",
                    article.read) : React.createElement(React.Fragment, null,
                    React.createElement(Clock3, { size: 12 }),
                    article.date,
                    " ",
                    React.createElement("span", { className: "meta-divider" }, "|"),
                    " ",
                    article.read)))));
}
function Events({ onEvent }) { return React.createElement("div", { className: "events-card" },
    React.createElement("div", { className: "events-heading" },
        React.createElement("span", null,
            React.createElement(CalendarDays, { size: 17 }),
            " Agenda escolar"),
        React.createElement("button", { onClick: () => onEvent(events[0]) },
             "Ver agenda ",
            React.createElement(ArrowRight, { size: 13 }))),
    events.map(e => React.createElement("button", { key: e.title, className: "event-row", onClick: () => onEvent(e) },
        React.createElement("span", { className: "date-square" },
            e.day,
            React.createElement("small", null, e.month)),
        React.createElement("span", { className: "event-info" },
            React.createElement("strong", null, e.title),
            React.createElement("span", null,
                e.place,
                " ",
                React.createElement("b", { className: "dot" }, "\u2022"),
                " ",
                e.time)),
        React.createElement(ChevronRight, { size: 16 })))); }
function Featured({ onArticle, onEvent, filter, onFilter }) {
    var _a, _b;
    const base = articles.slice(0, 3);
    const focus = filter === 'all' ? base[0] : (articles.find(a => a.filter === filter) || base[0]);
    const mids = base.filter(a => a.id !== focus.id);
    while (mids.length < 2)
        mids.push(base[mids.length + 1]);
    return React.createElement("section", { className: "page-shell featured-section", id: "historias" },
        React.createElement(SectionHeading, { icon: Star, title: filter === 'all' ? 'Historias destacadas' : `${(_b = (_a = filters.find(f => f.id === filter)) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : 'Historias'} destacadas`, onClick: () => { var _a; onFilter('all'); (_a = document.querySelector('#publicaciones')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' }); }, action: "Ver todas las historias" }),
        React.createElement("div", { className: "featured-grid" },
            React.createElement(FeatureCard, { article: focus, onArticle: onArticle }),
            React.createElement("div", { className: "side-stories" }, mids.slice(0, 2).map(a => React.createElement(FeatureCard, { article: a, key: a.id, onArticle: onArticle, variant: "small" }))),
            React.createElement("aside", { className: "right-rail" },
                React.createElement("div", { className: "quote-card quote-photo-card" },
                    React.createElement(Slot, { asset: "faithImage", className: "quote-photo", label: "Crucifijo frente a un vitral de iglesia" }),
                    React.createElement("div", { className: "quote-copy" },
                        React.createElement(Quote, { size: 26, className: "quote-icon" }),
                        React.createElement("blockquote", null, "Un liceo se construye cada día: con preguntas, encuentros y ganas de aprender."),
                        React.createElement("p", null, "Casa Hogar · Comunidad educativa"))),
                React.createElement(Events, { onEvent: onEvent }))));
}
function Latest({ onArticle, activeFilter, bookmarks, onBookmark }) {
    const cards = articles.slice(3);
    return React.createElement("section", { className: "latest-section", id: "publicaciones" },
        React.createElement(SectionHeading, { icon: BookOpen, title: "En el liceo", action: "Ver historias", onClick: () => { var _a; return (_a = document.querySelector('#historias')) === null || _a === void 0 ? void 0 : _a.scrollIntoView({ behavior: 'smooth' }); } }),
        React.createElement("div", { className: "post-grid" }, cards.map((a, i) => React.createElement("article", { className: "post-card", key: a.id },
            React.createElement("button", { className: "post-image-click", onClick: () => onArticle(a), "aria-label": 'Abrir ' + a.title },
                React.createElement(Slot, { className: "post-image", asset: a.image, label: 'Imagen pendiente: ' + a.title })),
            React.createElement("div", { className: "post-details" },
                React.createElement(Eyebrow, { color: i === 1 || i === 2 ? 'blue' : 'yellow' }, a.category),
                React.createElement("button", { className: "post-title", onClick: () => onArticle(a) }, a.title),
                React.createElement("div", { className: "post-foot" },
                    React.createElement("span", null,
                        a.date,
                        " ",
                        React.createElement("span", { className: "meta-divider" }, "|"),
                        " ",
                        a.read),
                    React.createElement("button", { className: bookmarks.includes(a.id) ? 'saved' : '', "aria-label": bookmarks.includes(a.id) ? 'Quitar de guardados' : 'Guardar artículo', title: "Guardar art\u00EDculo", onClick: () => onBookmark(a.id) },
                        React.createElement(Bookmark, { size: 15, fill: bookmarks.includes(a.id) ? 'currentColor' : 'none' }))))))));
}
function Podcasts({ onVideo }) {
    const [active, setActive] = useState(0);
    const bars = [8,16,11,25,18,30,12,22,34,16,27,12,21,9,17,26,13,20];
    return React.createElement("section", { className: "podcast-section", id: "multimedia" },
        React.createElement(SectionHeading, { icon: MessagesSquare, title: "Voces del liceo", action: "Explorar voces", onClick: () => onVideo(podcasts[active].title) }),
        React.createElement("div", { className: "podcast-layout" },
            React.createElement("div", { className: "podcast-feature" },
                React.createElement(Slot, { asset: "podcast", className: "podcast-poster", label: "Micrófono de grabación ilustrativo" },
                    React.createElement("div", { className: "podcast-title" },
                        React.createElement("strong", null, "VOCES", React.createElement("br", null), "DEL LICEO"),
                        React.createElement("p", null, "Historias que merecen", React.createElement("br", null), "ser escuchadas")),
                    React.createElement("div", { className: "podcast-wave", "aria-hidden": "true" }, bars.map((height, i) => React.createElement("span", { key: i, style: { height: height + 'px' } }))),
                    React.createElement("button", { className: "big-play", "aria-label": "Consultar audios de Voces del liceo", onClick: () => onVideo(podcasts[active].title) }, React.createElement(Play, { size: 21, fill: "currentColor" })),
                    React.createElement("span", { className: "podcast-duration" }, "Próximamente"))),
            React.createElement("div", { className: "podcast-episodes" }, podcasts.map((p, i) => React.createElement("button", { key: p.title, className: 'episode ' + (active === i ? 'episode-active' : ''), onClick: () => { setActive(i); onVideo(p.title); } },
                React.createElement("span", { className: "episode-icon" }, React.createElement(Play, { size: 13, fill: "currentColor" })),
                React.createElement("span", null, p.title, React.createElement("small", null, p.time)),
                React.createElement(ChevronRight, { size: 13 }))))));
}
function Campus({ onArticle }) { return React.createElement("section", { className: "campus-section", id: "vida-escolar" },
    React.createElement(SectionHeading, { icon: School, title: "Vida escolar", onClick: () => onArticle({ title: 'Vida escolar', category: 'VIDA ESCOLAR', excerpt: 'Experiencias y actividades de nuestro día a día en el liceo.' }) }),
    React.createElement("div", { className: "campus-layout" },
        React.createElement("button", { className: "campus-main", onClick: () => onArticle({ title: 'Aprender y crecer juntos', category: 'VIDA ESCOLAR', excerpt: 'Las aulas, los recreos y los proyectos compartidos también cuentan nuestra historia.' }) },
            React.createElement(Slot, { asset: "campus", className: "campus-image" },
                React.createElement("p", { className: "campus-handwriting" },
                    "Aquí",
                    React.createElement("br", null),
                    "crecemos",
                    React.createElement("br", null),
                    "juntos.",
                    React.createElement("span", null, "\u2197")),
                React.createElement("span", { className: "primary-btn campus-cta" },
                    "Explorar vida escolar ",
                    React.createElement(ArrowRight, { size: 15 })))),
        React.createElement("div", { className: "campus-news" }, campusLinks.map((c, i) => React.createElement("button", { key: c.title, onClick: () => onArticle({ ...c, category: 'VIDA ESCOLAR', excerpt: 'Una mirada a las experiencias de nuestra comunidad educativa.' }) },
            React.createElement(Slot, { asset: c.image, compact: true, className: "campus-thumbnail", label: 'Imagen ilustrativa: ' + c.title }),
            React.createElement("span", null,
                React.createElement("strong", null, c.title),
                React.createElement("small", null, c.date))))))); }
function Gallery({ onGallery }) { const [page, setPage] = useState(0); return React.createElement("section", { className: "gallery-section", id: "galeria" },
    React.createElement(SectionHeading, { icon: Camera, title: "Vida escolar en imágenes", action: "Ver galería", onClick: () => onGallery(0) }),
    React.createElement("div", { className: "gallery-wrap" },
        React.createElement("div", { className: "gallery-tiles" },
            React.createElement("button", { onClick: () => onGallery(page), className: "gallery-big" },
                React.createElement(Slot, { asset: "gallery1", label: "Foto de galer\u00EDa pendiente" })),
            React.createElement("div", { className: "gallery-grid" }, [0, 1, 2].map(i => React.createElement("button", { key: i, onClick: () => onGallery(page + i + 1) },
                React.createElement(Slot, { asset: 'gallery' + (i + 2), label: "Fotografía pendiente" }, i === 2 && React.createElement("strong", { className: "plus-images" }, "Ver galería")))))),
        React.createElement("div", { className: "mascot-space" },
            React.createElement(Slot, { asset: "storyFaith", className: "story-image", label: "Vitral de iglesia con cruz" }),
            React.createElement("span", { className: "story-kicker" }, "CASA HOGAR"),
            React.createElement("span", { className: "story-cross", "aria-hidden": "true" }, "✝"),
            React.createElement("p", null,
                React.createElement("span", null, "Cada"),
                React.createElement("br", null),
                "día cuenta",
                React.createElement("br", null),
                "una historia")),
        React.createElement("button", { className: "gallery-next", "aria-label": "Siguiente lote de fotograf\u00EDas", onClick: () => setPage(p => (p + 1) % 4) },
            React.createElement(ChevronRight, { size: 18 })))); }
function Readings({ onReading }) { return React.createElement("section", { className: "readings-section", id: "lecturas" },
    React.createElement(SectionHeading, { icon: BookOpen, title: "Lecturas recomendadas", onClick: () => onReading(readings[0]) }),
    React.createElement("div", { className: "reading-grid" }, readings.map((r, i) => React.createElement("button", { className: "reading-card", key: r.name, onClick: () => onReading(r) },
        React.createElement(Slot, { asset: r.image, className: "book-cover", label: 'Portada pendiente: ' + r.name }, !ASSETS[r.image] && React.createElement(BookOpen, { size: 28, className: "book-dummy-icon" })),
        React.createElement("span", { className: "reading-copy" },
            React.createElement(Eyebrow, null, r.category),
            React.createElement("strong", null, r.name),
            React.createElement("small", null, r.author)),
        React.createElement(ArrowRight, { size: 15, className: "reading-arrow" }))))); }
function Footer({ theme, onTheme, subEmail, setSubEmail, onSubscribe, subMessage }) { return React.createElement("footer", { id: "footer" },
    React.createElement("div", { className: "footer-main page-shell" },
        React.createElement("div", { className: "footer-brand" },
            React.createElement(Brand, { footer: true })),
        React.createElement("div", { className: "footer-links" },
            React.createElement("strong", null, "Enlaces"),
            React.createElement("div", null, [['Inicio', '#inicio'], ['El liceo', '#historias'], ['Vida escolar', '#vida-escolar'], ['Aprendizaje', '#publicaciones'], ['Comunidad', '#historias'], ['Galería', '#galeria'], ['Lecturas', '#lecturas'], ['Contacto', '#footer']].map(([t, url]) => React.createElement("a", { key: t, href: url }, t)))),
        React.createElement("div", { className: "footer-subscribe" },
            React.createElement("strong", null, "Suscr\u00EDbete"),
            React.createElement("p", null,
                "Recibe nuestras historias, eventos y reflexiones",
                React.createElement("br", null),
                "en tu correo."),
            React.createElement("form", { onSubmit: onSubscribe },
                React.createElement("input", { type: "email", required: true, placeholder: "Tu correo electr\u00F3nico", value: subEmail, onChange: e => setSubEmail(e.target.value) }),
                React.createElement("button", { type: "submit" }, "Suscribirme")),
            subMessage && React.createElement("small", { className: "subscribe-note" }, subMessage)),
        React.createElement("div", { className: "footer-social" },
            React.createElement("strong", null, "S\u00EDguenos"),
            React.createElement("div", { className: "socials" },
                React.createElement("a", { href: "https://instagram.com", target: "_blank", rel: "noreferrer", "aria-label": "Instagram" },
                    React.createElement(Instagram, { size: 17 })),
                React.createElement("a", { href: "https://youtube.com", target: "_blank", rel: "noreferrer", "aria-label": "YouTube" },
                    React.createElement(Youtube, { size: 18 })),
                React.createElement("a", { href: "https://facebook.com", target: "_blank", rel: "noreferrer", "aria-label": "Facebook" },
                    React.createElement(Facebook, { size: 17 })),
                React.createElement("a", { href: "https://x.com", target: "_blank", rel: "noreferrer", "aria-label": "X" },
                    React.createElement("span", { className: "x-letter" }, "\uD835\uDD4F")),
                React.createElement("a", { href: "https://open.spotify.com", target: "_blank", rel: "noreferrer", "aria-label": "Spotify" },
                    React.createElement(Headphones, { size: 17 }))),
            React.createElement("button", { className: "footer-theme", onClick: onTheme },
                theme === 'dark' ? React.createElement(Sun, { size: 14 }) : React.createElement(Moon, { size: 14 }),
                " Modo ",
                theme === 'dark' ? 'claro' : 'oscuro'))),
    React.createElement("div", { className: "footer-bottom" },
        React.createElement("div", { className: "page-shell" },
            React.createElement("span", null, "© Casa Hogar. Fotografías ilustrativas de ", React.createElement("a", { href: "https://unsplash.com/license", target: "_blank", rel: "noreferrer" }, "Unsplash"), "."),
            React.createElement("span", null, "Educaci\u00F3n\u00A0 \u00B7 \u00A0Fe\u00A0 \u00B7 \u00A0Servicio\u00A0 \u00B7 \u00A0Comunidad\u00A0 \u00B7 \u00A0Un mundo mejor")))); }
function Modal({ modal, onClose }) { useEffect(() => { if (!modal)
    return; const esc = e => { if (e.key === 'Escape')
    onClose(); }; document.addEventListener('keydown', esc); const before = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.removeEventListener('keydown', esc); document.body.style.overflow = before; }; }, [modal, onClose]); if (!modal)
    return null; const { type, item } = modal; return React.createElement("div", { className: "modal-backdrop", onMouseDown: e => e.target === e.currentTarget && onClose() },
    React.createElement("div", { role: "dialog", "aria-modal": "true", "aria-label": (item === null || item === void 0 ? void 0 : item.title) || 'Contenido de Casa Hogar', className: "modal-box" },
        React.createElement("button", { className: "modal-close", onClick: onClose, "aria-label": "Cerrar" },
            React.createElement(X, { size: 20 })),
        type === 'article' ? React.createElement(React.Fragment, null,
            React.createElement(Eyebrow, null, item.category || 'CASA HOGAR'),
            React.createElement("h2", null, item.title),
            React.createElement("p", { className: "modal-meta" },
                item.date || 'Vida escolar',
                " ",
                item.read && ' · ' + item.read),
            React.createElement(Slot, { className: "modal-slot", asset: item.image || '' }),
            React.createElement("p", null, item.excerpt || 'Próximamente compartiremos más sobre esta historia de nuestra comunidad educativa.'),
            React.createElement("p", { className: "modal-disclaimer" }, "Esta p\u00E1gina reproduce la interfaz de la referencia. El art\u00EDculo completo se incorporar\u00E1 cuando se a\u00F1ada el contenido editorial definitivo.")) : type === 'video' ? React.createElement(React.Fragment, null,
            React.createElement("h2", null, item),
            React.createElement("div", { className: "modal-video" },
                React.createElement(CirclePlay, { size: 56 }),
                React.createElement("p", null, "Espacio reservado para el reproductor")),
            React.createElement("p", null, "La interfaz est\u00E1 preparada para conectar el archivo de video, podcast o una URL embebida. No se incluye contenido audiovisual en este ZIP.")) : type === 'event' ? React.createElement(React.Fragment, null,
            React.createElement(Eyebrow, null, "PR\u00D3XIMO EVENTO"),
            React.createElement("h2", null, item.title),
            React.createElement("p", null,
                React.createElement(CalendarDays, { size: 18, style: { verticalAlign: 'middle' } }),
                " ",
                item.day,
                " de ",
                item.month,
                " \u00B7 ",
                item.time),
            React.createElement("p", null,
                React.createElement(Globe2, { size: 18, style: { verticalAlign: 'middle' } }),
                " ",
                item.place),
            React.createElement("p", { className: "modal-disclaimer" }, "Los eventos se muestran como contenido de demostraci\u00F3n basado en la referencia.")) : type === 'reading' ? React.createElement(React.Fragment, null,
            React.createElement(Eyebrow, null, item.category),
            React.createElement("h2", null, item.name),
            React.createElement("p", null,
                "Autor: ",
                item.author),
            React.createElement(Slot, { className: "modal-slot modal-book", asset: item.image }),
            React.createElement("p", null, "Espacio reservado para la sinopsis, ficha del libro y enlace externo.")) : React.createElement(React.Fragment, null,
            React.createElement("h2", null, "Vida escolar en imágenes"),
            React.createElement(Slot, { className: "modal-slot", asset: 'gallery' + ((item % 5) + 1) }),
            React.createElement("p", null, "Imagen ilustrativa. Las fotos reales del liceo podrán incorporarse aquí.")))); }
function App() {
    const [theme, setTheme] = useState(() => { try {
        return localStorage.getItem('veritas_theme') || 'dark';
    }
    catch (_a) {
        return 'dark';
    } });
    const [filter, setFilter] = useState('all'), [search, setSearch] = useState(''), [searchOpen, setSearchOpen] = useState(false), [modal, setModal] = useState(null), [bookmarks, setBookmarks] = useState([]), [subEmail, setSubEmail] = useState(''), [subMessage, setSubMessage] = useState('');
    useEffect(() => { document.documentElement.dataset.theme = theme; try {
        localStorage.setItem('veritas_theme', theme);
    }
    catch (_a) { } }, [theme]);
    const searchResults = useMemo(() => articles.filter(a => [a.title, a.category, a.excerpt].join(' ').toLowerCase().includes(search.toLowerCase())), [search]);
    const openArticle = (item) => setModal({ type: 'article', item }), openVideo = (title) => setModal({ type: 'video', item: title }), openEvent = (item) => setModal({ type: 'event', item }), openReading = (item) => setModal({ type: 'reading', item }), openGallery = (i) => setModal({ type: 'gallery', item: i });
    const toggleBookmark = (id) => setBookmarks(old => old.includes(id) ? old.filter(x => x !== id) : [...old, id]);
    const subscribe = (e) => { e.preventDefault(); setSubMessage('Demostración: correo validado. Conecta tu servicio de suscripción para enviar registros reales.'); };
    return React.createElement("div", { className: "website" },
        React.createElement(Header, { theme: theme, onTheme: () => setTheme(v => v === 'dark' ? 'light' : 'dark'), toggleSearch: setSearchOpen, searchOpen: searchOpen, search: search, setSearch: setSearch, searchResults: searchResults, onArticle: openArticle }),
        React.createElement(Ticker, null),
        React.createElement("main", null,
            React.createElement(Hero, { onArticle: openArticle, onVideo: openVideo }),
            React.createElement(FilterNav, { selected: filter, onSelect: setFilter }),
            React.createElement("div", { className: "editorial-bg" },
                React.createElement(Featured, { filter: filter, onFilter: setFilter, onArticle: openArticle, onEvent: openEvent }),
                React.createElement("div", { className: "page-shell lower-body" },
                    React.createElement("div", { className: "double-row double-podcast" },
                        React.createElement(Latest, { onArticle: openArticle, activeFilter: filter, bookmarks: bookmarks, onBookmark: toggleBookmark }),
                        React.createElement(Podcasts, { onVideo: openVideo })),
                    React.createElement("div", { className: "double-row double-gallery" },
                        React.createElement(Campus, { onArticle: openArticle }),
                        React.createElement(Gallery, { onGallery: openGallery })),
                    React.createElement(Readings, { onReading: openReading })))),
        React.createElement(Footer, { theme: theme, onTheme: () => setTheme(v => v === 'dark' ? 'light' : 'dark'), subEmail: subEmail, setSubEmail: setSubEmail, onSubscribe: subscribe, subMessage: subMessage }),
        React.createElement(Modal, { modal: modal, onClose: () => setModal(null) }));
}

MiniReact.mount(App,document.getElementById("root"));
