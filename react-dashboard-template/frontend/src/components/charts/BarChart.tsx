"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartManager, type ChartData, type ChartConfig } from "@/lib/ChartManager"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BarChartProps {
  data: ChartData[]
  config: ChartConfig
  title: string
  description: string
}

export function BarChart({ data, config, title, description }: BarChartProps) {
  const chartManager = new ChartManager(data, config)
  const monthlyData = chartManager.getMonthlyData()
  
  // Calculate trend
  const currentMonth = monthlyData.slice(-1)[0]
  const previousMonth = monthlyData.slice(-2)[0]
  const trend = chartManager.calculateTrend([currentMonth], [previousMonth])

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <RechartsBarChart
            accessibilityLayer
            data={monthlyData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="desktop" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="desktop"
              layout="vertical"
              fill="var(--color-desktop)"
              radius={4}
            >
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-[--color-label]"
                fontSize={12}
              />
              <LabelList
                dataKey="desktop"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending {trend >= 0 ? "up" : "down"} by {Math.abs(trend).toFixed(1)}% this month{" "}
          <TrendingUp className={`h-4 w-4 ${trend < 0 ? "rotate-180" : ""}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
