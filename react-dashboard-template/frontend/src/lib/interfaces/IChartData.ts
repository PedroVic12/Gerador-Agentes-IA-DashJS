export interface IChartData {
  date?: string;
  month?: string;
  desktop: number;
  mobile: number;
  [key: string]: string | number | undefined;
}

export interface IChartConfig {
  [key: string]: {
    label: string;
    color?: string;
  };
}

export interface IChartProps {
  data: IChartData[];
  config: IChartConfig;
  title: string;
  description: string;
}
