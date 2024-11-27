class GoogleSheetsService {
  private readonly API_URL: string;
  private readonly SCRIPT_ID: string;

  constructor() {
    this.API_URL = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL || '';
    this.SCRIPT_ID = process.env.NEXT_PUBLIC_SCRIPT_ID || '';
  }

  async fetchExercises() {
    try {
      const response = await fetch(`${this.API_URL}?action=getExercises`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  }

  async addExercise(exercise: {
    name: string;
    description: string;
    type: string;
    completed: boolean;
  }) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addExercise',
          exercise,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  }

  async updateExercise(id: string, updates: Partial<{
    name: string;
    description: string;
    type: string;
    completed: boolean;
  }>) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateExercise',
          id,
          updates,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  }

  async deleteExercise(id: string) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteExercise',
          id,
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
