// src/data/curso.ts

export interface Disciplina {
  id: number;
  codigo: string;
  nome: string;
  semestre_ideal: number;
  creditos: number;
  carga_horaria: number;
  prerequisitos: string[];
  categoria: 'Obrigatória' | 'Optativa' | 'TCC' | 'Prática Profissional';
}

// Carga Horária total prevista para cada categoria, conforme o PPC
export const CH_PREVISTA = {
  OBRIGATORIAS: 2910,
  OPTATIVAS: 120,
  PRATICA_PROFISSIONAL: 240,
  TCC: 60,
  ATIVIDADES_COMPLEMENTARES: 200,
};

// Dados extraídos da Matriz Curricular (PPC), agora com CATEGORIAS
export const MATRIZ_CURRICULAR: Disciplina[] = [
  // 1º Semestre
  { id: 1, codigo: 'INF101', nome: 'Introdução à Computação', semestre_ideal: 1, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 2, codigo: 'INF102', nome: 'Lógica e Linguagem de Programação', semestre_ideal: 1, creditos: 8, carga_horaria: 120, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 3, codigo: 'GEC101', nome: 'Leitura e Produção Textual', semestre_ideal: 1, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 4, codigo: 'EDC101', nome: 'Informática na Educação', semestre_ideal: 1, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 5, codigo: 'MAT101', nome: 'Introdução à Matemática', semestre_ideal: 1, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 6, codigo: 'GEC102', nome: 'Ciência, Tecnologia e Sociedade', semestre_ideal: 1, creditos: 2, carga_horaria: 30, prerequisitos: [], categoria: 'Obrigatória' },
  // 2º Semestre
  { id: 7, codigo: 'INF201', nome: 'Estruturas de Dados', semestre_ideal: 2, creditos: 8, carga_horaria: 120, prerequisitos: ['INF102'], categoria: 'Obrigatória' },
  { id: 8, codigo: 'INF202', nome: 'Circuitos Digitais', semestre_ideal: 2, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 9, codigo: 'GEC201', nome: 'Inglês Técnico I', semestre_ideal: 2, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 10, codigo: 'EDC201', nome: 'História da Educação', semestre_ideal: 2, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 11, codigo: 'MAT201', nome: 'Cálculo Diferencial e Integral I', semestre_ideal: 2, creditos: 4, carga_horaria: 60, prerequisitos: ['MAT101'], categoria: 'Obrigatória' },
  { id: 12, codigo: 'MAT202', nome: 'Algebra Vet. e Geometria Analítica', semestre_ideal: 2, creditos: 4, carga_horaria: 60, prerequisitos: ['MAT101'], categoria: 'Obrigatória' },
  // 3º Semestre
  { id: 13, codigo: 'INF301', nome: 'Programação Orientada a Objeto', semestre_ideal: 3, creditos: 8, carga_horaria: 120, prerequisitos: ['INF201'], categoria: 'Obrigatória' },
  { id: 14, codigo: 'INF302', nome: 'Organização de Arquivos e Dados', semestre_ideal: 3, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 15, codigo: 'INF304', nome: 'Análise e Projeto de Algoritmos', semestre_ideal: 3, creditos: 4, carga_horaria: 60, prerequisitos: ['INF201'], categoria: 'Obrigatória' },
  { id: 16, codigo: 'EDC301', nome: 'Filosofia da Educação', semestre_ideal: 3, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 17, codigo: 'MAT301', nome: 'Cálculo Diferencial e Integral II', semestre_ideal: 3, creditos: 4, carga_horaria: 60, prerequisitos: ['MAT201'], categoria: 'Obrigatória' },
  { id: 18, codigo: 'MAT302', nome: 'Algebra Linear', semestre_ideal: 3, creditos: 4, carga_horaria: 60, prerequisitos: ['MAT202'], categoria: 'Obrigatória' },
  // 4º Semestre
  { id: 19, codigo: 'INF401', nome: 'Arquitetura de Computadores', semestre_ideal: 4, creditos: 4, carga_horaria: 60, prerequisitos: ['INF202'], categoria: 'Obrigatória' },
  { id: 20, codigo: 'INF402', nome: 'Linguagens Formais e Autômatos', semestre_ideal: 4, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 21, codigo: 'INF403', nome: 'Laboratório de Programação I', semestre_ideal: 4, creditos: 4, carga_horaria: 60, prerequisitos: ['INF301'], categoria: 'Obrigatória' },
  { id: 22, codigo: 'INF404', nome: 'Banco de Dados I', semestre_ideal: 4, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 23, codigo: 'MAT401', nome: 'Probabilidade e Estatística', semestre_ideal: 4, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 24, codigo: 'INF405', nome: 'Projeto Integrador I', semestre_ideal: 4, creditos: 6, carga_horaria: 90, prerequisitos: [], categoria: 'Obrigatória' },
  // 5º Semestre
  { id: 25, codigo: 'INF501', nome: 'Sistemas Operacionais', semestre_ideal: 5, creditos: 4, carga_horaria: 60, prerequisitos: ['INF401'], categoria: 'Obrigatória' },
  { id: 26, codigo: 'INF502', nome: 'Laboratório de Programação II', semestre_ideal: 5, creditos: 4, carga_horaria: 60, prerequisitos: ['INF403'], categoria: 'Obrigatória' },
  { id: 27, codigo: 'INF503', nome: 'Teoria de Computação', semestre_ideal: 5, creditos: 4, carga_horaria: 60, prerequisitos: ['INF402'], categoria: 'Obrigatória' },
  { id: 28, codigo: 'INF504', nome: 'Engenharia de Software', semestre_ideal: 5, creditos: 6, carga_horaria: 90, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 29, codigo: 'INF505', nome: 'Banco de Dados II', semestre_ideal: 5, creditos: 4, carga_horaria: 60, prerequisitos: ['INF404'], categoria: 'Obrigatória' },
  { id: 30, codigo: 'GEC501', nome: 'Metodologia da Pesquisa', semestre_ideal: 5, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  // 6º Semestre
  { id: 31, codigo: 'INF601', nome: 'Grafos', semestre_ideal: 6, creditos: 4, carga_horaria: 60, prerequisitos: ['INF201'], categoria: 'Obrigatória' },
  { id: 32, codigo: 'INF602', nome: 'Laboratório de Programação III', semestre_ideal: 6, creditos: 4, carga_horaria: 60, prerequisitos: ['INF502'], categoria: 'Obrigatória' },
  { id: 33, codigo: 'INF603', nome: 'Interface Humano-Computador', semestre_ideal: 6, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 34, codigo: 'INF604', nome: 'Redes de Computadores', semestre_ideal: 6, creditos: 6, carga_horaria: 90, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 35, codigo: 'INF605', nome: 'Web Design', semestre_ideal: 6, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 36, codigo: 'GEC601', nome: 'Empreendedorismo', semestre_ideal: 6, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  // 7º Semestre
  { id: 37, codigo: 'INF701', nome: 'Inteligência Artificial', semestre_ideal: 7, creditos: 4, carga_horaria: 60, prerequisitos: ['INF201'], categoria: 'Obrigatória' },
  { id: 38, codigo: 'OPT701', nome: 'Optativa I', semestre_ideal: 7, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Optativa' },
  { id: 39, codigo: 'INF702', nome: 'Sistemas Distribuídos', semestre_ideal: 7, creditos: 4, carga_horaria: 60, prerequisitos: ['INF604'], categoria: 'Obrigatória' },
  { id: 40, codigo: 'INF703', nome: 'Direito Aplicado a Informática', semestre_ideal: 7, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 41, codigo: 'INF704', nome: 'Gestão de Projetos', semestre_ideal: 7, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 42, codigo: 'INF705', nome: 'Projeto Integrador II', semestre_ideal: 7, creditos: 6, carga_horaria: 90, prerequisitos: [], categoria: 'Obrigatória' },
  // 8º Semestre
  { id: 43, codigo: 'INF803', nome: 'Compiladores', semestre_ideal: 8, creditos: 4, carga_horaria: 60, prerequisitos: ['INF201'], categoria: 'Obrigatória' },
  { id: 44, codigo: 'INF804', nome: 'Estágio', semestre_ideal: 8, creditos: 16, carga_horaria: 240, prerequisitos: [], categoria: 'Prática Profissional' },
  { id: 45, codigo: 'INF805', nome: 'Tópicos Avançados em Programação', semestre_ideal: 8, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Obrigatória' },
  { id: 46, codigo: 'INF801', nome: 'Trabalho de Conclusão de Curso', semestre_ideal: 8, creditos: 4, carga_horaria: 60, prerequisitos: ['GEC501'], categoria: 'TCC' },
  { id: 47, codigo: 'INF802', nome: 'Segurança da Informação', semestre_ideal: 8, creditos: 4, carga_horaria: 60, prerequisitos: ['INF702'], categoria: 'Obrigatória' },
  { id: 48, codigo: 'OPT801', nome: 'Optativa II', semestre_ideal: 8, creditos: 4, carga_horaria: 60, prerequisitos: [], categoria: 'Optativa' },
];

// --- CALENDÁRIO ATUALIZADO ---
// Dados extraídos e consolidados dos arquivos:
// - 2023_diren_calendario_superiores_18dez.pdf
// - 2024_diren_calendario_2023_2024_ajustado_ensino-superior_10jul.pdf (Prioritário para 2024)
// - calendario_superior-2025.pdf
export const CALENDARIO_ACADEMICO = [
    { semestre: "2023.2", inicio: "2023-09-13", fim: "2024-02-29" },
    { semestre: "2024.1", inicio: "2024-03-11", fim: "2024-10-17" }, // Ajustado pós-greve
    { semestre: "2024.2", inicio: "2024-11-04", fim: "2025-04-24" }, // Ajustado pós-greve
    { semestre: "2025.1", inicio: "2025-05-07", fim: "2025-09-20" },
    { semestre: "2025.2", inicio: "2025-10-06", fim: "2026-03-24" },
];
