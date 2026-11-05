// Fotografías auténticas de la U.E.C. Casa Hogar "Monseñor Carrillo" (Trujillo, Venezuela).
export const ASSETS = {
  hero: '/assets/fachada-colegio.jpg',
  featuredService: '/assets/aula-clases.jpg',
  faithSociety: '/assets/misa-escolar.jpg',
  innovation: '/assets/altar-sagrado-corazon.jpg',
  faithImage: '/assets/coronacion-virgen.jpg',
  storyFaith: '/assets/viacrucis-trujillo.jpg',
  campus: '/assets/patio-central-campus.jpg',
  campusPasillo: '/assets/pasillo-aniversario.jpg',
  campusJuegos: '/assets/juegos-patio.jpg',
  campusNavidad: '/assets/acto-navidad.jpg',
  gallery1: '/assets/graduacion-auditorio.jpg',
  gallery2: '/assets/acto-dia-madre.jpg',
  gallery3: '/assets/fiesta-familiar.jpg',
  gallery4: '/assets/viacrucis-escena.jpg',
  gallery5: '/assets/logo-70-aniversario.jpg',
  podcast: '/assets/collage-70-aniversario.jpg',
  articleAI: '/assets/carnaval-creatividad.jpg',
  articleTestimony: '/assets/estudiantes-pentecostes.jpg',
  articleSolidarity: '/assets/comedor-comunidad.jpg',
  articleOpinion: '/assets/asamblea-bachillerato.jpg',
  reading1: '/assets/programa-preescolar.jpg',
  reading2: '/assets/programa-sexto-grado.jpg',
  reading3: '/assets/programa-bachillerato.jpg',
  reading4: '/assets/estampa-san-francisco.jpg',
};

export const IMAGE_ALTS = {
  hero: 'Fachada colonial de la U.E.C. Casa Hogar Monseñor Carrillo en Trujillo',
  featuredService: 'Estudiantes de Casa Hogar en salón de clases con uniforme escolar',
  faithSociety: 'Eucaristía y misa escolar en el patio techado de Casa Hogar',
  innovation: 'Estudiantes en acto cívico y religioso al Sagrado Corazón de Jesús',
  faithImage: 'Coronación de la Virgen María con niños angelitos en Casa Hogar',
  storyFaith: 'Viacrucis viviente de los estudiantes de Casa Hogar por las calles de Trujillo',
  campus: 'Patio central techado y pasillos de la U.E.C. Casa Hogar',
  campusPasillo: 'Pasillo colonial decorado con motivo del 70º Aniversario',
  campusJuegos: 'Niños de preescolar en ronda y actividades recreativas en la cancha',
  campusNavidad: 'Presentación artística y navideña en el escenario del colegio',
  gallery1: 'Acto de graduación académica en el auditorio con altar y escudo luminoso',
  gallery2: 'Celebración y acto cultural del Día de la Madre en el liceo',
  gallery3: 'Comunidad educativa y familias reunidas en fiesta navideña',
  gallery4: 'Representación de la pasión de Cristo y viacrucis viviente estudiantil',
  gallery5: 'Emblema oficial conmemorativo del 70º Aniversario de Casa Hogar (1956-2026)',
  podcast: 'Collage del 70º Aniversario con docentes, hermanas y San Francisco de Asís',
  articleAI: 'Presentación escolar de Carnaval con disfraces y creatividad de los niños',
  articleTestimony: 'Estudiantes de Casa Hogar unidos con franelas de Paz y Bien en Pentecostés',
  articleSolidarity: 'Docentes, hermanas religiosas y personal compartiendo almuerzo en el comedor escolar',
  articleOpinion: 'Asamblea y encuentro formativo con estudiantes de bachillerato',
  reading1: 'Programa oficial del Acto de Promoción de Preescolar frente a la gruta',
  reading2: 'Programa oficial del Acto de Promoción de 6to Grado de Primaria',
  reading3: 'Programa oficial del Acto de Grado de Bachillerato (5to Año)',
  reading4: 'Estampa e inspiración de San Francisco de Asís (Paz y Bien)',
};

export const heroSlides = [
  { eyebrow: 'APRENDER, CONVIVIR, CRECER', lines: ['Jóvenes', 'que', 'el mañana'], highlight: 'iluminan', description: 'Un espacio para descubrir lo que sucede en las aulas, compartir experiencias y acompañar cada etapa de la vida escolar.', tag: 'VIDA ESCOLAR' },
  { eyebrow: '70 AÑOS FORMANDO', lines: ['Desde 1956', 'con espíritu', 'franciscano'], highlight: 'espíritu', description: 'Formación académica y en valores con el carisma de las Hermanas Franciscanas y la comunidad trujillana.', tag: 'FORMACIÓN' },
  { eyebrow: 'NUESTRA COMUNIDAD', lines: ['Cada historia', 'tiene un lugar', 'aquí'], highlight: '', description: 'Estudiantes, docentes y familias construyen juntos la experiencia de nuestro liceo.', tag: 'COMUNIDAD' },
];

export const ticker = [
  'U.E.C. Casa Hogar Monseñor Carrillo  ·  70 Años de historia y educación',
  'Paz y Bien  ·  Formando generaciones con espíritu franciscano',
  'Vida escolar  ·  Conoce las actividades de nuestra comunidad',
  'Aprendizaje  ·  Proyectos y experiencias dentro del aula',
];

export const filters = [
  { id: 'all', label: 'Todo', icon: 'all' },
  { id: 'faith', label: 'Formación', icon: 'formation' },
  { id: 'campus', label: 'Vida escolar', icon: 'school' },
  { id: 'science', label: 'Ciencia y arte', icon: 'creative' },
  { id: 'social', label: 'Comunidad', icon: 'community' },
  { id: 'testimonies', label: 'Voces', icon: 'voices' },
  { id: 'opinion', label: 'Ideas', icon: 'ideas' },
  { id: 'media', label: 'Multimedia', icon: 'media' },
];

export const articles = [
  { id: 'convivencia', category: 'VIDA ESCOLAR', filter: 'campus', title: 'Aprender juntos en el aula y en comunidad', excerpt: 'Las clases, los proyectos compartidos y las actividades del liceo son parte de una experiencia escolar que se construye día a día.', read: '5 min de lectura', author: 'Comunidad educativa', image: 'featuredService', type: 'featured' },
  { id: 'formacion', category: 'FORMACIÓN', filter: 'faith', title: 'Crecer con respeto, diálogo y confianza', excerpt: 'Acompañar a cada estudiante implica escuchar, celebrar la fe y aprender a convivir con valores franciscanos.', read: '4 min', image: 'faithSociety', type: 'side' },
  { id: 'proyectos', category: 'VIDA ESCOLAR', filter: 'campus', title: 'Actividades que fortalecen la identidad escolar', excerpt: 'Una invitación a poner en práctica lo aprendido en las tradiciones y encuentros del colegio.', read: '3 min', image: 'innovation', type: 'side' },
  { id: 'curiosidad', category: 'CIENCIA Y ARTE', filter: 'science', title: 'La creatividad y el arte en el escenario', excerpt: 'La expresión artística, las obras teatrales y las festividades abren nuevas formas de aprender con alegría.', read: '4 min', image: 'articleAI' },
  { id: 'experiencia', category: 'VOCES', filter: 'testimonies', title: 'Paz y Bien: lo que aprendemos al compartir', excerpt: 'Una mirada a las amistades y vivencias que acompañan cada etapa de la vida en Casa Hogar.', read: '6 min', image: 'articleTestimony' },
  { id: 'comunidad', category: 'COMUNIDAD', filter: 'social', title: 'Pequeños gestos que construyen comunidad', excerpt: 'Docentes, hermanas religiosas y familias compartiendo el día a día de la educación.', read: '3 min', image: 'articleSolidarity' },
  { id: 'ideas', category: 'IDEAS', filter: 'opinion', title: 'Escuchar y dialogar para crecer juntos', excerpt: 'Los encuentros formativos y las asambleas estudiantiles fortalecen el pensamiento y el criterio propio.', read: '5 min', image: 'articleOpinion' },
];

export const events = [
  { day: '04', month: 'OCT.', title: 'Fiesta de San Francisco de Asís', place: 'Patio central', time: '8:00 a. m.' },
  { day: '15', month: 'NOV.', title: 'Semana Aniversaria de Casa Hogar', place: 'Auditorio', time: '9:00 a. m.' },
  { day: '08', month: 'DIC.', title: 'Encuentro navideño familiar', place: 'Canchas del colegio', time: '10:00 a. m.' },
];

export const podcasts = [
  { title: 'Voces de Casa Hogar: 70 Años de historia', time: '12:30 min' },
  { title: 'Espíritu Franciscano y Valores Escolares', time: '9:45 min' },
  { title: 'Testimonios de Estudiantes y Docentes', time: '14:20 min' },
];

export const campusLinks = [
  { title: 'Pasillos coloniales y memoria histórica', date: '70º Aniversario', image: 'campusPasillo' },
  { title: 'Deporte, rondas y recreación infantil', date: 'Educación física', image: 'campusJuegos' },
  { title: 'Expresión cultural y celebraciones', date: 'Arte y teatro', image: 'campusNavidad' },
];

export const readings = [
  { category: 'PROMOCIÓN', name: 'Acto de Promoción de Preescolar', author: 'U.E.C. Casa Hogar', image: 'reading1' },
  { category: 'GRADUACIÓN', name: 'Promoción de 6to Grado de Primaria', author: 'U.E.C. Casa Hogar', image: 'reading2' },
  { category: 'BACHILLERATO', name: 'Acto de Grado de 5to Año de Bachillerato', author: 'U.E.C. Casa Hogar', image: 'reading3' },
  { category: 'ESPIRITUALIDAD', name: 'Oración y Paz de San Francisco de Asís', author: 'Carisma franciscano', image: 'reading4' },
];
