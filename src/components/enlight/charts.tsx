"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"

import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"

export function PerformanceGauge({ value }: { value: number }) {
  const progressValue = (value / 150) * 100;
  return (
    <div className="w-full h-full flex flex-col justify-center px-2">
      <div className="relative h-2 w-full rounded-full bg-secondary">
        <Progress value={progressValue} className={`h-2 [&>div]:bg-primary ${value > 100 ? '[&>div]:bg-green-500' : ''}`} />
      </div>
      <div className="relative w-full text-xs text-muted-foreground mt-1.5">
        <div className="absolute left-[33.33%] -translate-x-1/2">50%</div>
        <div className="absolute left-[66.67%] -translate-x-1/2">100%</div>
      </div>
    </div>
  )
}


export function SalesLineChart({ data, lines }: { data: any[], lines: { key: string, color: string }[] }) {
  const chartConfig = lines.reduce((acc, line) => {
    acc[line.key] = {
      label: line.key,
      color: line.color,
    }
    return acc;
  }, {} as any);

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value/1000}k`} />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
            formatter={(value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)}
          />
          {lines.map(line => (
             <Line key={line.key} type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}


export function PerformanceBarChart({ data }: { data: any[] }) {
  const chartConfig = {
    performance: {
      label: "Performance vs. Plan",
      color: "hsl(var(--primary))",
    },
  };
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
          <XAxis dataKey="country" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}%`} />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
            formatter={(value) => `${value}%`}
           />
          <Bar dataKey="performance" fill="hsl(var(--primary))" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

export function SimpleWaterfallChart({ data }: { data: any[] }) {
  const chartConfig = {
    value: { label: "Revenue (in millions)" }
  };
  const colors = ["hsl(var(--chart-2))", "hsl(var(--primary))", "hsl(var(--chart-1))"]

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ left: 10, right: 10 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            tickLine={false}
            axisLine={false}
          />
          <Tooltip cursor={{ fill: "hsl(var(--accent))" }} content={<ChartTooltipContent hideIndicator />} />
          <Bar dataKey="value" stackId="a">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
