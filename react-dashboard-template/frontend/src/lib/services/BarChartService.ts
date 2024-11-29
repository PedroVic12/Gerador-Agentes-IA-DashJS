import { IChartData, IChartConfig } from "../interfaces/IChartData";
import { AbstractChartService } from "./AbstractChartService";

export class BarChartService extends AbstractChartService {
  constructor(data: IChartData[], config: IChartConfig) {
    super(data, config);
  }

  public filterData(): IChartData[] {
    return this.data.filter((item) => item.month);
  }

  public calculateTrend(): number {
    const monthlyData = this.filterData();
    const currentMonth = monthlyData.slice(-1)[0];
    const previousMonth = monthlyData.slice(-2)[0];

    if (!currentMonth || !previousMonth) return 0;

    const currentTotal = currentMonth.desktop + currentMonth.mobile;
    const previousTotal = previousMonth.desktop + previousMonth.mobile;
    
    if (previousTotal === 0) return 0;
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  }
}
