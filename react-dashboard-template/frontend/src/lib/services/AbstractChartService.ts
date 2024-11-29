import { IChartData, IChartConfig } from "../interfaces/IChartData";

export abstract class AbstractChartService {
  protected data: IChartData[];
  protected config: IChartConfig;

  constructor(data: IChartData[], config: IChartConfig) {
    this.data = data;
    this.config = config;
  }

  abstract filterData(): IChartData[];
  abstract calculateTrend(): number;
  
  public getConfig(): IChartConfig {
    return this.config;
  }

  public getData(): IChartData[] {
    return this.data;
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
}
