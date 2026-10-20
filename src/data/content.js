// Fotografías ilustrativas de Unsplash; no representan alumnos ni instalaciones de Casa Hogar.
const photo = (id, width = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
export const ASSETS = {
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

export const IMAGE_ALTS = {
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

export const heroSlides = [
  { eyebrow: 'APRENDER, CONVIVIR, CRECER', lines: ['Jóvenes', 'que', 'el mañana'], highlight: 'iluminan', description: 'Un espacio para descubrir lo que sucede en las aulas, compartir experiencias y acompañar cada etapa de la vida escolar.', tag: 'VIDA ESCOLAR' },
  { eyebrow: 'APRENDIZAJE EN ACCIÓN', lines: ['Ideas que nacen', 'en el aula', 'y van más allá'], highlight: '', description: 'Proyectos, preguntas y actividades que invitan a aprender con curiosidad y trabajar en equipo.', tag: 'APRENDIZAJE' },
  { eyebrow: 'NUESTRA COMUNIDAD', lines: ['Cada historia', 'tiene un lugar', 'aquí'], highlight: '', description: 'Estudiantes, docentes y familias construyen juntos la experiencia de nuestro liceo.', tag: 'COMUNIDAD' },
];

export const ticker = [
  'Vida escolar  ·  Conoce las actividades de nuestra comunidad',
  'Aprendizaje  ·  Proyectos y experiencias dentro del aula',
  'Comunidad  ·  Espacios para estudiantes y familias',
  'Cultura  ·  Arte, lectura y expresión en el liceo',
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
  { id: 'convivencia', category: 'VIDA ESCOLAR', filter: 'campus', title: 'Aprender juntos también ocurre fuera del aula', excerpt: 'El recreo, los proyectos compartidos y las actividades del liceo son parte de una experiencia escolar que se construye entre todos.', read: '5 min de lectura', author: 'Comunidad educativa', image: 'featuredService', type: 'featured' },
  { id: 'formacion', category: 'FORMACIÓN', filter: 'faith', title: 'Crecer con respeto, diálogo y confianza', excerpt: 'Acompañar a cada estudiante implica escuchar, conversar y aprender a convivir.', read: '4 min', image: 'faithSociety', type: 'side' },
  { id: 'proyectos', category: 'VIDA ESCOLAR', filter: 'campus', title: 'Proyectos que conectan el aula con el mundo', excerpt: 'Una invitación a explorar ideas y poner en práctica lo aprendido.', read: '3 min', image: 'innovation', type: 'side' },
  { id: 'curiosidad', category: 'CIENCIA Y ARTE', filter: 'science', title: 'La curiosidad es el punto de partida', excerpt: 'Preguntar, experimentar y crear abre nuevas formas de aprender.', read: '4 min', image: 'articleAI' },
  { id: 'experiencia', category: 'VOCES', filter: 'testimonies', title: 'Lo que aprendemos al compartir', excerpt: 'Una mirada a las amistades y experiencias que acompañan la etapa escolar.', read: '6 min', image: 'articleTestimony' },
  { id: 'comunidad', category: 'COMUNIDAD', filter: 'social', title: 'Pequeños gestos que construyen comunidad', excerpt: 'La colaboración cotidiana también forma parte de la educación.', read: '3 min', image: 'articleSolidarity' },
  { id: 'ideas', category: 'IDEAS', filter: 'opinion', title: 'Escuchar otras ideas nos ayuda a crecer', excerpt: 'El diálogo y el pensamiento propio tienen lugar dentro y fuera del aula.', read: '5 min', image: 'articleOpinion' },
];

export const events = [
  { day: '01', month: 'PRÓX.', title: 'Actividades del liceo', place: 'Próximamente', time: 'Por confirmar' },
  { day: '02', month: 'PRÓX.', title: 'Encuentros con familias', place: 'Próximamente', time: 'Por confirmar' },
  { day: '03', month: 'PRÓX.', title: 'Talleres y proyectos', place: 'Próximamente', time: 'Por confirmar' },
];

export const podcasts = [
  { title: 'Conversaciones de nuestra comunidad', time: 'Próximamente' },
  { title: 'Aprender dentro y fuera del aula', time: 'Próximamente' },
  { title: 'Historias del liceo', time: 'Próximamente' },
];

export const campusLinks = [
  { title: 'Aprender también es compartir', date: 'Vida escolar', image: 'gallery2' },
  { title: 'Deporte, juego y trabajo en equipo', date: 'Actividades', image: 'campus' },
  { title: 'Arte y creatividad en el aula', date: 'Proyectos', image: 'gallery3' },
];

export const readings = [
  { category: 'LECTURA', name: 'Historias para descubrir', author: 'Selección del liceo', image: 'reading1' },
  { category: 'APRENDIZAJE', name: 'Preguntas para seguir explorando', author: 'Selección del liceo', image: 'reading2' },
  { category: 'CONVIVENCIA', name: 'Aprender a vivir juntos', author: 'Selección del liceo', image: 'reading3' },
  { category: 'CREATIVIDAD', name: 'Ideas para imaginar y crear', author: 'Selección del liceo', image: 'reading4' },
];
