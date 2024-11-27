'use client';

import { useState, useCallback, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Home() {
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

  const handleCheck = useCallback(
    (exerciseId: number, itemIndex: number) => {
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
    },
    [exercises]
  );

  const lineChartData = {
    labels: workoutData.days,
    datasets: [
      {
        label: 'Pull-ups',
        data: workoutData.pullups,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Flexões',
        data: workoutData.flexoes,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const averagePullups = workoutData.pullups.reduce((a, b) => a + b, 0) / workoutData.pullups.length;
  const averageFlexoes = workoutData.flexoes.reduce((a, b) => a + b, 0) / workoutData.flexoes.length;

  const pieChartData = {
    labels: ['Média Pull-ups', 'Média Flexões'],
    datasets: [
      {
        data: [averagePullups, averageFlexoes],
        backgroundColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
      },
    ],
  };

  useEffect(() => {
    const total = exercises.reduce((acc, ex) => acc + ex.items.length, 0);
    setStats(prev => ({
      ...prev,
      totalItems: total,
    }));
  }, [exercises]);

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        style={{ display: isDrawerOpen ? "block" : "none" }}
        onClick={() => setIsDrawerOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li className="p-2 hover:bg-gray-100 rounded cursor-pointer">
              Dashboard
            </li>
            <li className="p-2 hover:bg-gray-100 rounded cursor-pointer">
              Exercícios
            </li>
            <li className="p-2 hover:bg-gray-100 rounded cursor-pointer">
              Quiz
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="mb-4 p-2 rounded bg-blue-500 text-white"
        >
          Menu
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Exercícios do Dia</h2>
                <button
                  onClick={() => setQuizMode(!quizMode)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {quizMode ? "Voltar aos Exercícios" : "Modo Quiz"}
                </button>
              </div>

              {!quizMode && (
                <div className="space-y-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="border-b pb-4 last:border-b-0"
                    >
                      <h3 className="text-xl font-semibold mb-3">
                        {exercise.name}
                      </h3>
                      <div className="space-y-2">
                        {exercise.items.map((item, index) => {
                          const isChecked =
                            completedItems[`${exercise.id}-${index}`];
                          return (
                            <div
                              key={index}
                              className={`flex items-center p-2 rounded ${
                                isChecked ? "bg-green-100" : "bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheck(exercise.id, index)}
                                className="h-5 w-5 text-blue-600"
                              />
                              <span className="ml-3">{item}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg">Progresso</span>
                    <span className="font-bold">{stats.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.totalCompleted}
                    </div>
                    <div className="text-sm text-gray-600">Completados</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-3xl font-bold text-gray-600">
                      {stats.totalItems}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Progresso Semanal</h3>
                <div className="relative" style={{ height: "300px" }}>
                  <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">
                  Distribuição de Exercícios
                </h3>
                <div className="relative" style={{ height: "300px" }}>
                  <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
