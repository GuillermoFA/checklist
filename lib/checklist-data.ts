export interface Question {
  id: string;
  category: string;
  question: string;
  hint: string;
  critical?: boolean;
}

export interface Answer {
  questionId: string;
  response: boolean | null;
  observation?: string;
  priority?: 'baja' | 'media' | 'alta';
  photos?: string[];
  timestamp?: string;
}

export interface ChecklistSubmission {
  id: string;
  patente: string;
  numeroMovil: string;
  conductor: string;
  fecha: string;
  kilometraje: string;
  proximaMantencion: string;
  answers: Answer[];
  observacionesGenerales?: string;
  createdAt: string;
  status: 'draft' | 'completed';
}

export const questions: Question[] = [
  // Luces
  { id: "luces_bajas", category: "Luces", question: "¿Funcionan las luces bajas correctamente?", hint: "Verificar encendido y potencia de ambas luces", critical: true },
  { id: "luces_altas", category: "Luces", question: "¿Funcionan las luces altas correctamente?", hint: "Verificar encendido y potencia de ambas luces", critical: true },
  { id: "luz_retroceso", category: "Luces", question: "¿Funciona la luz de marcha atrás?", hint: "Colocar reversa y verificar", critical: false },
  { id: "luz_freno", category: "Luces", question: "¿Funcionan las luces de freno?", hint: "Pisar pedal y verificar encendido", critical: true },
  { id: "tercera_luz_freno", category: "Luces", question: "¿Funciona la tercera luz de freno?", hint: "Verificar luz central trasera", critical: false },
  { id: "intermitentes", category: "Luces", question: "¿Funcionan los intermitentes?", hint: "Verificar ambos lados y hazard", critical: true },
  { id: "luz_patente", category: "Luces", question: "¿Funciona la luz de patente?", hint: "Verificar iluminación de placa trasera", critical: false },
  { id: "baliza", category: "Luces", question: "¿Funciona la baliza correctamente?", hint: "Verificar luz de emergencia superior", critical: false },
  { id: "alarma_retroceso", category: "Luces", question: "¿Funciona la alarma de retroceso?", hint: "Verificar sonido al poner reversa", critical: true },

  // Neumáticos
  { id: "neumaticos_delanteros", category: "Neumáticos", question: "¿Los neumáticos delanteros están en buen estado?", hint: "Revisar profundidad de labrado y desgaste", critical: true },
  { id: "neumaticos_traseros", category: "Neumáticos", question: "¿Los neumáticos traseros están en buen estado?", hint: "Revisar profundidad de labrado y desgaste", critical: true },
  { id: "neumaticos_repuesto", category: "Neumáticos", question: "¿El neumático de repuesto está en buen estado?", hint: "Verificar presión y condición", critical: false },
  { id: "traba_tuercas", category: "Neumáticos", question: "¿Tiene traba tuercas completas?", hint: "Verificar todas las ruedas", critical: false },

  // Seguridad
  { id: "extintor", category: "Seguridad", question: "¿El extintor está presente y vigente?", hint: "Verificar fecha de vencimiento y sello", critical: true },
  { id: "botiquin", category: "Seguridad", question: "¿El botiquín está completo?", hint: "Verificar contenido básico", critical: true },
  { id: "triangulos", category: "Seguridad", question: "¿Tiene los triángulos de seguridad?", hint: "Verificar que estén completos (2 unidades)", critical: true },
  { id: "cinturon", category: "Seguridad", question: "¿Funcionan los cinturones de seguridad?", hint: "Verificar conductor y pasajeros", critical: true },
  { id: "bocina", category: "Seguridad", question: "¿Funciona la bocina?", hint: "Presionar y verificar sonido", critical: true },
  { id: "cunas", category: "Seguridad", question: "¿Tiene las cuñas?", hint: "Verificar presencia de cuñas", critical: false },

  // Herramientas
  { id: "gata", category: "Herramientas", question: "¿Tiene gata hidráulica?", hint: "Verificar funcionamiento", critical: false },
  { id: "llave_rueda", category: "Herramientas", question: "¿Tiene llave de rueda (cruz)?", hint: "Verificar que corresponda a las tuercas", critical: false },

  // Espejos y Visibilidad
  { id: "espejos", category: "Visibilidad", question: "¿Los espejos están en buen estado?", hint: "Verificar ajuste y claridad", critical: true },
  { id: "parabrisas", category: "Visibilidad", question: "¿El parabrisas está en buen estado?", hint: "Verificar que no tenga trizaduras", critical: true },
  { id: "vidrios", category: "Visibilidad", question: "¿Los vidrios están en buen estado?", hint: "Verificar funcionamiento eléctrico si aplica", critical: false },

  // Fluidos
  { id: "nivel_agua", category: "Fluidos", question: "¿El nivel de agua está correcto?", hint: "Verificar depósito de refrigerante", critical: true },
  { id: "agua_parabrisas", category: "Fluidos", question: "¿Tiene agua para el parabrisas?", hint: "Verificar depósito limpiaparabrisas", critical: false },
  { id: "nivel_aceite", category: "Fluidos", question: "¿El nivel de aceite está correcto?", hint: "Verificar con motor frío", critical: true },
  { id: "combustible", category: "Fluidos", question: "¿Tiene combustible suficiente?", hint: "Verificar indicador del tablero", critical: true },

  // Frenos y Dirección
  { id: "frenos", category: "Frenos", question: "¿Funcionan los frenos correctamente?", hint: "Presionar pedal, verificar resistencia", critical: true },
  { id: "direccion", category: "Dirección", question: "¿La dirección funciona correctamente?", hint: "Verificar que no haya holguras", critical: true },

  // Documentación
  { id: "permiso_circulacion", category: "Documentación", question: "¿El permiso de circulación está vigente?", hint: "Verificar fecha de vencimiento", critical: true },
  { id: "revision_tecnica", category: "Documentación", question: "¿La revisión técnica está vigente?", hint: "Verificar fecha de vencimiento", critical: true },
  { id: "seguro_obligatorio", category: "Documentación", question: "¿El seguro obligatorio está vigente?", hint: "Verificar fecha de vencimiento", critical: true },
  { id: "decreto_80", category: "Documentación", question: "¿El decreto 80 está vigente?", hint: "Verificar fecha de vencimiento", critical: true },

  // Carrocería
  { id: "carroceria", category: "Carrocería", question: "¿La carrocería está en buen estado?", hint: "Verificar abolladuras, rayones, oxidación", critical: false },
];

export const categories = [...new Set(questions.map(q => q.category))];

export const STORAGE_KEY = 'checklist_draft';
export const SUBMISSIONS_KEY = 'checklist_submissions';

export function getStoredDraft(): Partial<ChecklistSubmission> | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function saveDraft(data: Partial<ChecklistSubmission>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearDraft() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getSubmissions(): ChecklistSubmission[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SUBMISSIONS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveSubmission(submission: ChecklistSubmission) {
  if (typeof window === 'undefined') return;
  const submissions = getSubmissions();
  submissions.push(submission);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
}
