"use client";

import { useState, useEffect, useMemo } from 'react';
import { MATRIZ_CURRICULAR, CALENDARIO_ACADEMICO, CH_PREVISTA, Disciplina } from './data/curso';
import { cn } from './lib/utils';
import { Calendar, BookOpen, TrendingUp, CheckCircle, Clock, AlertCircle, RefreshCw, GraduationCap } from 'lucide-react';
import './App.css';

// --- FUNÇÃO DE CÁLCULO FINAL E COMPLETA ---
function calcularResultados(concluidasIds: Set<number>, dataIngresso: string) {
  console.log('🔄 Recalculando resultados...', { dataIngresso, totalConcluidas: concluidasIds.size });

  // 1. Cálculos de Progresso por Categoria
  const disciplinasConcluidas = MATRIZ_CURRICULAR.filter(d => concluidasIds.has(d.id));
  const chCumprida: Record<Disciplina['categoria'], number> = {
    'Obrigatória': 0, 'Optativa': 0, 'Prática Profissional': 0, 'TCC': 0,
  };
  disciplinasConcluidas.forEach(d => { chCumprida[d.categoria] += d.carga_horaria; });
  const chTotalCumprida = Object.values(chCumprida).reduce((acc, val) => acc + val, 0);
  const chTotalPrevista = CH_PREVISTA.OBRIGATORIAS + CH_PREVISTA.OPTATIVAS + CH_PREVISTA.PRATICA_PROFISSIONAL + CH_PREVISTA.TCC;
  const percentualGeral = chTotalPrevista > 0 ? (chTotalCumprida / chTotalPrevista * 100) : 0;

  // 2. Projeção de Formatura (LÓGICA CORRIGIDA)
  const disciplinasPendentes = MATRIZ_CURRICULAR.filter(d => !concluidasIds.has(d.id));
  const disciplinasObrigatoriasPendentes = disciplinasPendentes.filter(d => d.categoria === 'Obrigatória');

  console.log('📋 Análise das disciplinas:', {
    totalPendentes: disciplinasPendentes.length,
    obrigatoriasPendentes: disciplinasObrigatoriasPendentes.length
  });

  let projecao = { semestre: "N/A", data: "Informe a data de ingresso" };

  // Se não há disciplinas pendentes, curso está concluído
  if (disciplinasPendentes.length === 0) {
    projecao = { semestre: "Concluído!", data: "Parabéns! Curso finalizado!" };
    console.log('🎉 Curso concluído!');
    return {
      progressoPorCategoria: {
        'Disciplinas Obrigatórias': {
          prevista: CH_PREVISTA.OBRIGATORIAS,
          cumprida: chCumprida['Obrigatória'],
          pendente: CH_PREVISTA.OBRIGATORIAS - chCumprida['Obrigatória'],
        },
        'Disciplinas Optativas': {
          prevista: CH_PREVISTA.OPTATIVAS,
          cumprida: chCumprida['Optativa'],
          pendente: CH_PREVISTA.OPTATIVAS - chCumprida['Optativa'],
        },
        'Prática Profissional': {
          prevista: CH_PREVISTA.PRATICA_PROFISSIONAL,
          cumprida: chCumprida['Prática Profissional'],
          pendente: CH_PREVISTA.PRATICA_PROFISSIONAL - chCumprida['Prática Profissional'],
        },
        'Disciplinas de TCC': {
          prevista: CH_PREVISTA.TCC,
          cumprida: chCumprida['TCC'],
          pendente: CH_PREVISTA.TCC - chCumprida['TCC'],
        },
        'Atividades Complementares': {
          prevista: CH_PREVISTA.ATIVIDADES_COMPLEMENTARES,
          cumprida: 0,
          pendente: CH_PREVISTA.ATIVIDADES_COMPLEMENTARES - 0,
        },
      },
      percentualGeral,
      disciplinasPendentes,
      projecao
    };
  }

  // Validar e processar data de ingresso
  if (!dataIngresso || dataIngresso.length < 7) {
    console.log('⚠️ Data de ingresso inválida:', dataIngresso);
    projecao = { semestre: "N/A", data: "Data de ingresso inválida" };
  } else {
    try {
      // Processar data no formato YYYY-MM
      const [anoStr, mesStr] = dataIngresso.split('-');
      const anoIngresso = parseInt(anoStr);
      const mesIngresso = parseInt(mesStr);

      console.log('📅 Data processada:', { ano: anoIngresso, mes: mesIngresso });

      if (isNaN(anoIngresso) || isNaN(mesIngresso) || mesIngresso < 1 || mesIngresso > 12) {
        throw new Error('Data inválida');
      }

      // Determinar semestre de ingresso baseado no mês
      let semestreIngressoSufixo: number;
      let anoIngressoAjustado: number;

      if (mesIngresso >= 3 && mesIngresso <= 9) {
        // Março a Setembro = semestre .1
        semestreIngressoSufixo = 1;
        anoIngressoAjustado = anoIngresso;
      } else {
        // Outubro a Fevereiro = semestre .2
        semestreIngressoSufixo = 2;
        // Janeiro/Fevereiro pertencem ao ano letivo anterior
        anoIngressoAjustado = (mesIngresso <= 2) ? anoIngresso - 1 : anoIngresso;
      }

      const semestreIngresso = `${anoIngressoAjustado}.${semestreIngressoSufixo}`;
      console.log('🎯 Semestre de ingresso:', semestreIngresso);

      // Calcular quantos semestres são necessários
      const DISCIPLINAS_POR_SEMESTRE_MEDIA = 6;
      const semestresNecessarios = Math.ceil(disciplinasObrigatoriasPendentes.length / DISCIPLINAS_POR_SEMESTRE_MEDIA);

      console.log('⏱️ Semestres necessários:', semestresNecessarios);

      // Encontrar posição do semestre de ingresso no calendário
      let posicaoIngresso = CALENDARIO_ACADEMICO.findIndex(sem => sem.semestre === semestreIngresso);

      if (posicaoIngresso === -1) {
        // Se não encontrar no calendário, calcular posição baseada no primeiro semestre
        const primeiroSemestre = CALENDARIO_ACADEMICO[0]; // 2023.2
        const [anoBase, semestreBase] = primeiroSemestre.semestre.split('.').map(n => parseInt(n));

        const diferencaAnos = anoIngressoAjustado - anoBase;
        posicaoIngresso = (diferencaAnos * 2) + (semestreIngressoSufixo - semestreBase);
        posicaoIngresso = Math.max(0, posicaoIngresso);

        console.log('📊 Posição calculada:', posicaoIngresso);
      } else {
        console.log('📍 Posição encontrada no calendário:', posicaoIngresso);
      }

      // Calcular semestre de formatura
      const posicaoFormatura = posicaoIngresso + semestresNecessarios - 1;
      console.log('🎓 Posição de formatura:', posicaoFormatura);

      if (posicaoFormatura < CALENDARIO_ACADEMICO.length) {
        // Formatura dentro do calendário disponível
        const semestreFinal = CALENDARIO_ACADEMICO[posicaoFormatura];
        const dataFim = new Date(semestreFinal.fim + 'T00:00:00');

        projecao = {
          semestre: semestreFinal.semestre,
          data: dataFim.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })
        };
        console.log('✅ Projeção calculada:', projecao);
      } else {
        // Extrapolar além do calendário
        const ultimoSemestre = CALENDARIO_ACADEMICO[CALENDARIO_ACADEMICO.length - 1];
        const semestresAdicionales = posicaoFormatura - (CALENDARIO_ACADEMICO.length - 1);

        const dataUltimoSemestre = new Date(ultimoSemestre.fim + 'T00:00:00');
        dataUltimoSemestre.setMonth(dataUltimoSemestre.getMonth() + (6 * semestresAdicionales));

        const anoFinal = dataUltimoSemestre.getFullYear();
        const semestreFinal = (dataUltimoSemestre.getMonth() < 6) ? 1 : 2;

        projecao = {
          semestre: `${anoFinal}.${semestreFinal} (Estimado)`,
          data: dataUltimoSemestre.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          }) + ' (Estimativa)'
        };
        console.log('📈 Projeção extrapolada:', projecao);
      }

    } catch (error) {
      console.error('❌ Erro no cálculo:', error);
      projecao = { semestre: "Erro", data: "Erro no cálculo da projeção" };
    }
  }

  console.log('🏁 Resultado final:', projecao);

  return {
    progressoPorCategoria: {
      'Disciplinas Obrigatórias': {
        prevista: CH_PREVISTA.OBRIGATORIAS,
        cumprida: chCumprida['Obrigatória'],
        pendente: CH_PREVISTA.OBRIGATORIAS - chCumprida['Obrigatória'],
      },
      'Disciplinas Optativas': {
        prevista: CH_PREVISTA.OPTATIVAS,
        cumprida: chCumprida['Optativa'],
        pendente: CH_PREVISTA.OPTATIVAS - chCumprida['Optativa'],
      },
      'Prática Profissional': {
        prevista: CH_PREVISTA.PRATICA_PROFISSIONAL,
        cumprida: chCumprida['Prática Profissional'],
        pendente: CH_PREVISTA.PRATICA_PROFISSIONAL - chCumprida['Prática Profissional'],
      },
      'Disciplinas de TCC': {
        prevista: CH_PREVISTA.TCC,
        cumprida: chCumprida['TCC'],
        pendente: CH_PREVISTA.TCC - chCumprida['TCC'],
      },
      'Atividades Complementares': {
        prevista: CH_PREVISTA.ATIVIDADES_COMPLEMENTARES,
        cumprida: 0,
        pendente: CH_PREVISTA.ATIVIDADES_COMPLEMENTARES - 0,
      },
    },
    percentualGeral,
    disciplinasPendentes,
    projecao
  };
}

// Componentes UI modernos
const Card = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("card-gradient rounded-lg shadow-sm", className)} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight text-card-foreground", className)} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props}>
    {children}
  </div>
);

const Progress = ({ value, className, ...props }: { value: number; className?: string }) => (
  <div className={cn("progress-bar-modern relative overflow-hidden", className)} {...props}>
    <div
      className="progress-bar-fill relative shimmer-effect"
      style={{ width: `${value}%` }}
    />
  </div>
);

const Badge = ({ children, variant = "default", className }: { children: React.ReactNode; variant?: "default" | "secondary" | "outline"; className?: string }) => {
  const variants = {
    default: "status-badge-complete",
    secondary: "status-badge-progress",
    outline: "status-badge-pending"
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = "default", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" }) => {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-border bg-background hover:bg-muted text-foreground"
  };

  return (
    <button
      className={cn("inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [ingresso, setIngresso] = useState<string>('2023-09');
  const [isMounted, setIsMounted] = useState(false);

  // Lógica de localStorage e handlers
  useEffect(() => {
    const savedIds = localStorage.getItem('disciplinasConcluidas');
    const savedIngresso = localStorage.getItem('dataIngresso');
    if (savedIds) setSelectedIds(new Set(JSON.parse(savedIds)));
    if (savedIngresso) setIngresso(savedIngresso);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('disciplinasConcluidas', JSON.stringify(Array.from(selectedIds)));
      localStorage.setItem('dataIngresso', ingresso);
    }
  }, [selectedIds, ingresso, isMounted]);

  const handleToggleDisciplina = (id: number) => {
    setSelectedIds(prev => {
      const newIds = new Set(prev);
      newIds.has(id) ? newIds.delete(id) : newIds.add(id);
      return newIds;
    });
  };

  // CORRIGIDO: Forçar recálculo sempre que ingresso ou selectedIds mudarem
  const resultados = useMemo(() => {
    if (!isMounted) return null;
    // Garantir que sempre recalcula quando a data de ingresso muda
    return calcularResultados(selectedIds, ingresso);
  }, [selectedIds, ingresso, isMounted]);

  const disciplinasPorSemestre = useMemo(() => {
    return MATRIZ_CURRICULAR.reduce((acc, d) => {
      (acc[d.semestre_ideal] = acc[d.semestre_ideal] || []).push(d);
      return acc;
    }, {} as Record<number, Disciplina[]>);
  }, []);

  const getStatusIcon = (disciplina: Disciplina) => {
    const isConcluida = selectedIds.has(disciplina.id);
    return isConcluida ? (
      <CheckCircle className="h-4 w-4 text-primary" />
    ) : (
      <AlertCircle className="h-4 w-4 text-muted-foreground" />
    );
  };

  const getCategoryClass = (categoria: Disciplina['categoria']) => {
    switch (categoria) {
      case 'Obrigatória': return 'category-obrigatoria';
      case 'Optativa': return 'category-optativa';
      case 'Prática Profissional': return 'category-pratica';
      case 'TCC': return 'category-tcc';
      default: return 'category-obrigatoria';
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <GraduationCap className="h-12 w-12 text-primary mx-auto animate-spin" />
          <p className="text-lg text-muted-foreground">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Progresso Acadêmico
        </h1>
        <p className="text-muted-foreground">Acompanhe seu desenvolvimento no curso de Ciência da Computação - IFBA</p>
      </div>

      {/* Grid com três seções */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seção 1: Matriz Curricular */}
        <Card className="lg:col-span-1 floating-card animate-fade-in-up">
          <CardHeader>
            <div className="text-sm text-muted-foreground mb-2">
              Seu Mês e Ano de Ingresso:
              <input
                type="month"
                value={ingresso}
                onChange={(e) => setIngresso(e.target.value)}
                className="ml-2 px-2 py-1 border border-border rounded text-foreground bg-input text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Matriz Curricular
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(disciplinasPorSemestre).map(([semestre, disciplinas]) => (
              <div key={semestre} className="semester-card animate-delay-1">
                <h4 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    {semestre}
                  </span>
                  {semestre}º Semestre
                </h4>
                <div className="space-y-2">
                  {disciplinas.map(d => (
                    <div key={d.id} className="discipline-item">
                      <input
                        type="checkbox"
                        id={`d-${d.id}`}
                        checked={selectedIds.has(d.id)}
                        onChange={() => handleToggleDisciplina(d.id)}
                        className="discipline-checkbox"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(d)}
                          <label htmlFor={`d-${d.id}`} className="font-medium text-sm text-card-foreground cursor-pointer truncate">
                            {d.codigo} - {d.nome}
                          </label>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn("category-badge", getCategoryClass(d.categoria))}>
                            {d.categoria}
                          </span>
                          <span className="workload-info">{d.carga_horaria}h</span>
                          {d.prerequisitos.length > 0 && (
                            <span className="text-muted-foreground truncate">
                              Pré-req: {d.prerequisitos.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Seção 2: Projeção de Formatura */}
        <Card className="lg:col-span-1 floating-card animate-fade-in-up animate-delay-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Projeção de Formatura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {resultados && (
              <>
                <div className="projection-card text-center space-y-2">
                  <div className="text-3xl font-bold text-primary">{resultados.projecao.semestre}</div>
                  <p className="text-sm text-muted-foreground">Semestre previsto para formatura</p>
                  <p className="text-xs text-muted-foreground">{resultados.projecao.data}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disciplinas Concluídas</span>
                    <span className="font-medium">
                      {MATRIZ_CURRICULAR.length - resultados.disciplinasPendentes.length}/{MATRIZ_CURRICULAR.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Disciplinas Restantes</span>
                    <span className="font-medium text-primary">
                      {resultados.disciplinasPendentes.length}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data de Ingresso</span>
                    <span className="font-medium">
                      {new Date(ingresso + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-sm text-foreground">Próximas Disciplinas</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {resultados.disciplinasPendentes.slice(0, 3).map(d => (
                      <li key={d.id} className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {d.nome}
                      </li>
                    ))}
                    {resultados.disciplinasPendentes.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{resultados.disciplinasPendentes.length - 3} disciplinas restantes
                      </li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Seção 3: Percentual de Progresso */}
        <Card className="lg:col-span-1 floating-card animate-fade-in-up animate-delay-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Percentual de Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {resultados && (
              <>
                <div className="flex items-center justify-center">
                  <div className="progress-circle">
                    <svg viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="8"
                        fill="transparent"
                        className="bg-circle stroke-[8]"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${resultados.percentualGeral * 2.51} 251`}
                        className="progress-fill stroke-[8]"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary">{resultados.percentualGeral.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">Completo</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progresso Geral</span>
                    <span className="font-medium">{resultados.percentualGeral.toFixed(1)}%</span>
                  </div>

                  <Progress value={resultados.percentualGeral} className="h-3" />

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Requisitos de Conclusão</h4>
                    {Object.entries(resultados.progressoPorCategoria).map(([nome, dados]) => (
                      <div key={nome} className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">{nome}</span>
                          <span className="font-medium">{dados.cumprida}/{dados.prevista}h</span>
                        </div>
                        <Progress value={(dados.cumprida / dados.prevista) * 100} className="h-1" />
                        <div className="flex justify-between items-center text-xs">
                          <Badge variant={dados.pendente <= 0 ? "default" : "outline"}>
                            {dados.pendente <= 0 ? 'Cumprido' : `${dados.pendente}h restantes`}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
