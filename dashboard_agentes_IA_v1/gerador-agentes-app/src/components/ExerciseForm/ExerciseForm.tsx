import React, { useState } from 'react';
import { googleSheetsService } from '@/services/googleSheets';

interface ExerciseFormProps {
  onSubmit: () => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ onSubmit }) => {
  const [exercise, setExercise] = useState({
    name: '',
    description: '',
    type: 'strength',
    completed: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await googleSheetsService.addExercise(exercise);
      setExercise({
        name: '',
        description: '',
        type: 'strength',
        completed: false,
      });
      onSubmit();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nome do Exercício
        </label>
        <input
          type="text"
          value={exercise.name}
          onChange={(e) => setExercise({ ...exercise, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          value={exercise.description}
          onChange={(e) => setExercise({ ...exercise, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tipo
        </label>
        <select
          value={exercise.type}
          onChange={(e) => setExercise({ ...exercise, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="strength">Força</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibilidade</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Adicionar Exercício
      </button>
    </form>
  );
};

export default ExerciseForm;
