"use client";

import { useState, useEffect, useMemo } from 'react';
import { MATRIZ_CURRICULAR, CH_PREVISTA, CALENDARIO_ACADEMICO, Disciplina } from './data/curso';
import './App.css';

// --- FUNÇÃO DE CÁLCULO CORRIGIDA E COMENTADA ---
function calcularResultados(concluidasIds: Set<number>) {
  // --- Bloco 1: Cálculo de Progresso (sem alterações, já estava correto) ---
  const disciplinasConcluidas = MATRIZ_CURRICULAR.filter(d => concluidasIds.has(d.id));
  const chCumprida: Record<Disciplina['categoria'], number> = {
    'Obrigatória': 0, 'Optativa': 0, 'Prática Profissional': 0, 'TCC': 0,
  };
  disciplinasConcluidas.forEach(d => { chCumprida[d.categoria] += d.carga_horaria; });
  const chTotalCumprida = Object.values(chCumprida).reduce((acc, val) => acc + val, 0);
  const chTotalPrevista = CH_PREVISTA.OBRIGATORIAS + CH_PREVISTA.OPTATIVAS + CH_PREVISTA.PRATICA_PROFISSIONAL + CH_PREVISTA.TCC;
  const percentualGeral = chTotalPrevista > 0 ? (chTotalCumprida / chTotalPrevista * 100) : 0;

  const disciplinasPendentes = MATRIZ_CURRICULAR.filter(d => !concluidasIds.has(d.id));
  const concluidasCodigos = new Set(disciplinasConcluidas.map(d => d.codigo));
  const elegiveis = disciplinasPendentes.filter(disciplina =>
    disciplina.prerequisitos.every(prereqCodigo => concluidasCodigos.has(prereqCodigo))
  );

  // --- Bloco 2: Projeção de Formatura (LÓGICA CORRIGIDA) ---
  let projecao = { semestre: "N/A", data: "Cálculo pendente" };

  if (disciplinasPendentes.length === 0) {
    projecao = { semestre: "Concluído!", data: "Parabéns!" };
  } else {
    // CORREÇÃO: A estimativa de ritmo deve se basear nas disciplinas que definem a duração do curso.
    // TCC, Estágio e Optativas muitas vezes são cursados em paralelo ou concentrados no final.
    const disciplinasObrigatoriasPendentes = disciplinasPendentes.filter(d => d.categoria === 'Obrigatória');
    const DISCIPLINAS_POR_SEMESTRE_MEDIA = 6; // Suposição razoável do ritmo do aluno.
    const semestresRestantes = Math.ceil(disciplinasObrigatoriasPendentes.length / DISCIPLINAS_POR_SEMESTRE_MEDIA) || (disciplinasPendentes.length > 0 ? 1 : 0);

    const hoje = new Date();
    let indiceSemestreAtual = -1;

    // LÓGICA REFINADA: Encontra o semestre atual ou o próximo a começar.
    // Isso é crucial para saber de qual ponto do calendário devemos partir.
    for (let i = 0; i < CALENDARIO_ACADEMICO.length; i++) {
      const sem = CALENDARIO_ACADEMICO[i];
      const inicioSemestre = new Date(sem.inicio + "T00:00:00"); // Adiciona T00:00 para evitar problemas de fuso horário
      const fimSemestre = new Date(sem.fim + "T23:59:59");

      if (inicioSemestre <= hoje && hoje <= fimSemestre) {
        indiceSemestreAtual = i;
        break;
      }
      if (hoje < inicioSemestre) { // Se estamos no recesso, o ponto de partida é o próximo semestre
        indiceSemestreAtual = i;
        break;
      }
    }

    // Se a data de hoje for posterior a todos os calendários, usamos o último como referência
    if (indiceSemestreAtual === -1) {
      indiceSemestreAtual = CALENDARIO_ACADEMICO.length - 1;
    }

    // CORREÇÃO: O cálculo do índice final precisa considerar que o semestre atual já faz parte da contagem.
    const indiceFormatura = indiceSemestreAtual + semestresRestantes - 1;

    if (indiceFormatura < CALENDARIO_ACADEMICO.length) {
      const semestreFinal = CALENDARIO_ACADEMICO[indiceFormatura];
      projecao = {
        semestre: semestreFinal.semestre,
        data: new Date(semestreFinal.fim + "T00:00:00").toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      };
    } else {
      // LÓGICA DE FALLBACK: Extrapola a data se o calendário conhecido não for suficiente
      const ultimoSemestre = CALENDARIO_ACADEMICO[CALENDARIO_ACADEMICO.length - 1];
      const semestresExtras = indiceFormatura - (CALENDARIO_ACADEMICO.length - 1);
      const dataFinalProjetada = new Date(ultimoSemestre.fim + "T00:00:00");
      dataFinalProjetada.setMonth(dataFinalProjetada.getMonth() + 6 * semestresExtras);

      const anoFinal = dataFinalProjetada.getFullYear();
      const periodoFinal = dataFinalProjetada.getMonth() < 6 ? 1 : 2;

      projecao = {
        semestre: `~${anoFinal}.${periodoFinal}`,
        data: dataFinalProjetada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) + " (Estimativa)"
      };
    }
  }

  // Monta o objeto final com todos os resultados
  const progressoPorCategoria = {
    'Disciplinas Obrigatórias': { prevista: CH_PREVISTA.OBRIGATORIAS, cumprida: chCumprida['Obrigatória'], pendente: CH_PREVISTA.OBRIGATORIAS - chCumprida['Obrigatória'],},
    'Disciplinas Optativas': { prevista: CH_PREVISTA.OPTATIVAS, cumprida: chCumprida['Optativa'], pendente: CH_PREVISTA.OPTATIVAS - chCumprida['Optativa'], },
    'Prática Profissional': { prevista: CH_PREVISTA.PRATICA_PROFISSIONAL, cumprida: chCumprida['Prática Profissional'], pendente: CH_PREVISTA.PRATICA_PROFISSIONAL - chCumprida['Prática Profissional'],},
    'Disciplinas de TCC': { prevista: CH_PREVISTA.TCC, cumprida: chCumprida['TCC'], pendente: CH_PREVISTA.TCC - chCumprida['TCC'],},
    'Atividades Complementares': { prevista: CH_PREVISTA.ATIVIDADES_COMPLEMENTARES, cumprida: 0, pendente: CH_PREVISTA.ATIVIDADES_COMPLEMENTARES - 0,},
  };

  return { progressoPorCategoria, percentualGeral, disciplinasPendentes, elegiveis, projecao };
}


// --- COMPONENTE PRINCIPAL (sem alterações na lógica de renderização) ---
export default function App() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [ingresso, setIngresso] = useState<string>('2023-09');
  const [isMounted, setIsMounted] = useState(false);

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

  const resultados = useMemo(() => {
    if (!isMounted) return null;
    return calcularResultados(selectedIds);
  }, [selectedIds, isMounted]);

  const disciplinasPorSemestre = useMemo(() => {
    return MATRIZ_CURRICULAR.reduce((acc, d) => {
      (acc[d.semestre_ideal] = acc[d.semestre_ideal] || []).push(d);
      return acc;
    }, {} as Record<number, Disciplina[]>);
  }, []);

  if (!isMounted) return <div className="loading">Carregando aplicação...</div>;

  return (
    <div className="container">
      <header>
        <h1>Acompanhamento de Progresso - Ciência da Computação IFBA</h1>
      </header>

      <main className="main-grid">
        <section className="card">
          <h2>Percentual de Progresso no Curso</h2>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${resultados?.percentualGeral.toFixed(2)}%` }}>
              {resultados?.percentualGeral.toFixed(2)}%
            </div>
          </div>
          <table className="progress-table">
            <thead>
              <tr>
                <th>Requisitos de Conclusão de Curso</th>
                <th>Situação</th>
                <th>CH Prevista</th>
                <th>CH Cumprido</th>
                <th>CH Pendente</th>
              </tr>
            </thead>
            <tbody>
              {resultados && Object.entries(resultados.progressoPorCategoria).map(([nome, dados]) => (
                <tr key={nome}>
                  <td>{nome}</td>
                  <td>
                    <span className={dados.pendente <= 0 ? 'status-cumprido' : 'status-nao-cumprido'}>
                      {dados.pendente <= 0 ? 'Cumprido' : 'Não-cumprido'}
                    </span>
                  </td>
                  <td>{dados.prevista}</td>
                  <td>{dados.cumprida}</td>
                  <td>{dados.pendente}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {resultados && (
            <div className="projection-section">
              <h3>Projeção de Formatura</h3>
              <p><strong>Semestre Previsto:</strong> {resultados.projecao.semestre}</p>
              <p><strong>Data Prevista:</strong> {resultados.projecao.data}</p>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Matriz Curricular</h2>
          <div className="input-group">
            <label htmlFor="ingresso">Seu Mês e Ano de Ingresso:</label>
            <input
              type="month"
              id="ingresso"
              value={ingresso}
              onChange={(e) => setIngresso(e.target.value)}
            />
          </div>
          <hr/>
          {Object.entries(disciplinasPorSemestre).map(([semestre, disciplinas]) => (
            <div key={semestre} className="semester-block">
              <h3>{semestre}º Semestre</h3>
              {disciplinas.map(d => (
                <div key={d.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`d-${d.id}`}
                    checked={selectedIds.has(d.id)}
                    onChange={() => handleToggleDisciplina(d.id)}
                  />
                  <label htmlFor={`d-${d.id}`}>{d.codigo} - {d.nome}</label>
                </div>
              ))}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
