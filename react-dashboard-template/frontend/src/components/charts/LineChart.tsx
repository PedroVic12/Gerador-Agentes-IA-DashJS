"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, LabelList, Line, LineChart as RechartsLineChart, XAxis } from "recharts"

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

interface LineChartProps {
  data: ChartData[]
  config: ChartConfig
  title: string
  description: string
}

export function LineChart({ data, config, title, description }: LineChartProps) {
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
          <RechartsLineChart
            accessibilityLayer
            data={monthlyData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            >
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Line>
          </RechartsLineChart>
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
