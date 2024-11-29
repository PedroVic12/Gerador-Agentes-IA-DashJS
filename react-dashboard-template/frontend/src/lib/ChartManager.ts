export interface ChartData {
  date?: string;
  month?: string;
  desktop: number;
  mobile: number;
}

export interface ChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

export class ChartManager {
  private data: ChartData[];
  private config: ChartConfig;

  constructor(data: ChartData[], config: ChartConfig) {
    this.data = data;
    this.config = config;
  }

  public filterDataByDateRange(endDate: Date, days: number): ChartData[] {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    return this.data.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);
      return date >= startDate && date <= endDate;
    });
  }

  public getMonthlyData(): ChartData[] {
    return this.data.filter((item) => item.month);
  }

  public calculateTrend(currentPeriod: ChartData[], previousPeriod: ChartData[]): number {
    const currentTotal = currentPeriod.reduce((sum, item) => sum + item.desktop + item.mobile, 0);
    const previousTotal = previousPeriod.reduce((sum, item) => sum + item.desktop + item.mobile, 0);
    
    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }

  public static formatDate(date: string, format: 'short' | 'long' = 'short'): string {
    const dateObj = new Date(date);
    if (format === 'short') {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  public getConfig(): ChartConfig {
    return this.config;
  }

  public getData(): ChartData[] {
    return this.data;
  }
}
