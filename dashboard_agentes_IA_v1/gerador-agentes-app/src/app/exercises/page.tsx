'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Menu/Sidebar';
import ExerciseForm from '@/components/ExerciseForm/ExerciseForm';
import { googleSheetsService } from '@/services/googleSheets';

export default function ExercisesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchExercises = async () => {
    try {
      const data = await googleSheetsService.fetchExercises();
      setExercises(data.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  const handleExerciseSubmit = () => {
    setShowForm(false);
    fetchExercises();
  };

  const handleDelete = async (id: string) => {
    try {
      await googleSheetsService.deleteExercise(id);
      fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      await googleSheetsService.updateExercise(id, { completed: !completed });
      fetchExercises();
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded bg-blue-500 text-white"
          >
            Menu
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="p-2 rounded bg-green-500 text-white"
          >
            {showForm ? 'Fechar Formulário' : 'Adicionar Exercício'}
          </button>
        </div>

        {showForm && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md">
            <ExerciseForm onSubmit={handleExerciseSubmit} />
          </div>
        )}

        {loading ? (
          <div className="text-center">Carregando...</div>
        ) : (
          <div className="grid gap-6">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{exercise.name}</h3>
                    <p className="text-gray-600 mb-2">{exercise.description}</p>
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                      {exercise.type}
                    </span>
                  </div>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleToggleComplete(exercise.id, exercise.completed)}
                      className={`px-3 py-1 rounded ${
                        exercise.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {exercise.completed ? 'Completo' : 'Pendente'}
                    </button>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="px-3 py-1 rounded bg-red-500 text-white"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
