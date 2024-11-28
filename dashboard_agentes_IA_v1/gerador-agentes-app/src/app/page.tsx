'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import StatusMetrics from '../components/StatusMetrics';
import Charts from '../components/Charts';
import Tables from '../components/Tables';
import Gauge from '../components/Gauge';

export default function Home() {
  const sampleData = {
    maintenance: [
      { date: "2024-01", value: 150, ships: 10, cost: 50000 },
      { date: "2024-02", value: 180, ships: 15, cost: 75000 },
      { date: "2024-03", value: 120, ships: 8, cost: 40000 },
      { date: "2024-04", value: 200, ships: 20, cost: 100000 },
    ],
  };

  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: "Revisão Teórica",
      items: [
        "Teorema de Thévenin",
        "Análise de malhas",
        "Análise nodal",
        "Leis de Kirchhoff",
        "Conceitos básicos de circuitos",
      ],
    },
    {
      id: 2,
      name: "Seleção dos Exercícios",
      items: [
        "Identificar capítulo do Sadiku",
        "Escolher 25 exercícios variados",
        "Priorizar exercícios combinados",
      ],
    },
    {
      id: 3,
      name: "Resolução dos Exercícios",
      items: [
        "Ler enunciado atentamente",
        "Desenhar circuito",
        "Escolher método adequado",
        "Aplicar método escolhido",
        "Verificar resposta",
      ],
    },
    {
      id: 4,
      name: "Análise dos Resultados",
      items: [
        "Comparar diferentes soluções",
        "Identificar padrões",
        "Analisar dificuldades",
      ],
    },
  ]);

  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalItems: 0,
    progress: 0,
  });

  const [quizMode, setQuizMode] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const workoutData = {
    pullups: [12, 15, 10, 14, 11],
    flexoes: [25, 30, 28, 32, 27],
    days: ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"],
  };

  const handleCheck = (exerciseId: number, itemIndex: number) => {
    setCompletedItems((prev) => {
      const key = `${exerciseId}-${itemIndex}`;
      const newState = { ...prev, [key]: !prev[key] };

      const completed = Object.values(newState).filter(Boolean).length;
      const total = exercises.reduce((acc, ex) => acc + ex.items.length, 0);

      setStats({
        totalCompleted: completed,
        totalItems: total,
        progress: Math.round((completed / total) * 100),
      });

      return newState;
    });
  };

  useEffect(() => {
    const total = exercises.reduce((acc, ex) => acc + ex.items.length, 0);
    setStats((prev) => ({ ...prev, totalItems: total }));
  }, [exercises]);

  return (
    <div className="min-h-screen bg-[#000000]">
      <Navigation />
      <div className="p-6">
        <Gauge />
        <StatusMetrics />
        <Tables sampleData={sampleData} />
        <Charts sampleData={sampleData} />
      </div>
    </div>
  );
}
