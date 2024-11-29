import { IChartData, IChartConfig } from "../interfaces/IChartData";
import { AbstractChartService } from "./AbstractChartService";

export class AreaChartService extends AbstractChartService {
  private timeRange: string;
  private endDate: Date;

  constructor(data: IChartData[], config: IChartConfig, timeRange: string = "90d") {
    super(data, config);
    this.timeRange = timeRange;
    this.endDate = new Date(data[data.length - 1].date!);
  }

  public setTimeRange(timeRange: string): void {
    this.timeRange = timeRange;
  }

  public filterData(): IChartData[] {
    const days = this.timeRange === "90d" ? 90 : this.timeRange === "30d" ? 30 : 7;
    const startDate = new Date(this.endDate);
    startDate.setDate(startDate.getDate() - days);

    return this.data.filter((item) => {
      if (!item.date) return false;
      const date = new Date(item.date);
      return date >= startDate && date <= this.endDate;
    });
  }

  public calculateTrend(): number {
    const filteredData = this.filterData();
    const currentPeriod = filteredData.slice(-7);
    const previousPeriod = filteredData.slice(-14, -7);

    const currentTotal = currentPeriod.reduce((sum, item) => sum + item.desktop + item.mobile, 0);
    const previousTotal = previousPeriod.reduce((sum, item) => sum + item.desktop + item.mobile, 0);
    
    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }
}
