"use client"

import * as React from "react"
import { AreaChart, BarChart, LineChart } from "@/components/charts"
import { IChartConfig, IChartData } from "@/lib/interfaces/IChartData"

const dailyData: IChartData[] = [
  { date: "2024-04-01", desktop: 222, mobile: 150 },
  { date: "2024-04-02", desktop: 97, mobile: 180 },
  { date: "2024-04-03", desktop: 167, mobile: 120 },
  // ... mais dados diários
]

const monthlyData: IChartData[] = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig: IChartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
}

export function ChartExample() {
  return (
    <div className="grid gap-6 p-6">
      <AreaChart
        data={dailyData}
        config={chartConfig}
        title="Daily Visitors"
        description="Interactive area chart showing daily visitor statistics"
      />
      <BarChart
        data={monthlyData}
        config={chartConfig}
        title="Monthly Visitors"
        description="Bar chart showing monthly visitor breakdown"
      />
      <LineChart
        data={monthlyData}
        config={chartConfig}
        title="Monthly Trends"
        description="Line chart showing monthly visitor trends"
      />
    </div>
  )
}
