"use client";

import React, { memo, useMemo, useState, useEffect } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, LineChart, Eye, EyeOff } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Custom tooltip component extracted outside for better performance
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  viewMode: ViewMode;
  showNet: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, viewMode, showNet }) => {
  if (active && payload?.length) {
    const data = payload[0].payload;
    
    const getSavingsRateColor = (_rate: number) => {
      return 'text-foreground';
    };

    return (
      <div className="bg-card border border-border rounded-lg  p-4 min-w-[200px]">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-2">
          {(viewMode === 'all' || viewMode === 'income') && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted/50-foreground"></div>
                <span className="text-sm text-muted-foreground">Income</span>
              </div>
              <span className="font-medium text-foreground">{formatCurrency(data.income)}</span>
            </div>
          )}
          {(viewMode === 'all' || viewMode === 'expenses') && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-foreground/60"></div>
                <span className="text-sm text-muted-foreground">Expenses</span>
              </div>
              <span className="font-medium text-foreground">{formatCurrency(data.expense)}</span>
            </div>
          )}
          {showNet && viewMode === 'all' && (
            <>
              <div className="h-px bg-border my-2"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-foreground/40"></div>
                  <span className="text-sm text-muted-foreground">Net Balance</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(data.net)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Savings Rate</span>
                <span className={`text-xs font-medium ${getSavingsRateColor(data.savingsRate)}`}>
                  {data.savingsRate.toFixed(1)}%
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

// Legend formatter component
const LegendFormatter = (value: string, entry: any, fontSize: number) => (
  <span style={{ color: entry.color, fontSize, fontWeight: 500 }}>
    {value}
  </span>
);

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  readonly monthlyData: MonthlyData[];
}

type ChartType = 'composed' | 'area' | 'bar';
type ViewMode = 'all' | 'income' | 'expenses';

function IncomeExpenseChartComponent({ monthlyData }: IncomeExpenseChartProps) {
  const [chartType, setChartType] = useState<ChartType>('composed');
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [showNet, setShowNet] = useState(true);
  const [windowWidth, setWindowWidth] = useState(768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Enhanced chart data with additional calculations
  const chartData = useMemo(() => {
    return monthlyData.map((item, index) => ({
      ...item,
      net: item.income - item.expense,
      savingsRate: item.income > 0 ? ((item.income - item.expense) / item.income) * 100 : 0,
      expenseRatio: item.income > 0 ? (item.expense / item.income) * 100 : 0,
      index
    }));
  }, [monthlyData]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = chartData.reduce((sum, item) => sum + item.expense, 0);
    const netBalance = totalIncome - totalExpenses;
    const avgIncome = totalIncome / (chartData.length || 1);
    const avgExpenses = totalExpenses / (chartData.length || 1);
    const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100) : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netBalance,
      avgIncome,
      avgExpenses,
      savingsRate
    };
  }, [chartData]);

  // Responsive chart configuration
  const chartConfig = useMemo(() => {
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth < 1024;
    
    let margin;
    if (isMobile) {
      margin = { top: 20, right: 15, left: 50, bottom: 80 };
    } else if (isTablet) {
      margin = { top: 25, right: 25, left: 60, bottom: 90 };
    } else {
      margin = { top: 30, right: 30, left: 70, bottom: 100 };
    }
    
    let fontSize;
    if (isMobile) {
      fontSize = 10;
    } else if (isTablet) {
      fontSize = 11;
    } else {
      fontSize = 12;
    }
    
    const intervalThreshold = isMobile ? 6 : 8;
    const tickInterval = chartData.length > intervalThreshold ? 1 : 0;
    
    let height;
    if (isMobile) {
      height = 280;
    } else if (isTablet) {
      height = 320;
    } else {
      height = 400;
    }
    
    return {
      margin,
      fontSize,
      tickInterval,
      height
    };
  }, [windowWidth, chartData.length]);

  // Neutral color scheme
  const colors = {
    income: {
      primary: '#4B5563',
      light: '#6B7280',
      gradient: 'url(#incomeGradient)',
      bg: 'rgba(75, 85, 99, 0.1)'
    },
    expense: {
      primary: '#1F2937',
      light: '#374151',
      gradient: 'url(#expenseGradient)',
      bg: 'rgba(31, 41, 55, 0.1)'
    },
    net: {
      positive: '#6B7280',
      negative: '#9CA3AF',
      neutral: '#6B7280'
    }
  };

  // Helper functions for styling
  const getSavingsRateStyles = (rate: number) => {
    const label = rate >= 20 ? 'Excellent' : rate >= 10 ? 'Good' : 'Needs Work';
    return {
      cardClass: 'border-border',
      textClass: 'text-muted-foreground',
      valueClass: 'text-foreground',
      badge: 'secondary' as const,
      label
    };
  };

  const savingsRateStyles = getSavingsRateStyles(metrics.savingsRate);

  // Empty state
  if (chartData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Income vs. Expenses
          </CardTitle>
          <CardDescription>Monthly financial flow comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <div className="w-16 h-16 rounded bg-muted/50/20 flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-lg mb-2">No data available</p>
            <p className="text-sm text-muted-foreground">Start adding transactions to see your financial flow</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-lg bg-muted">
                <DollarSign className="h-6 w-6 text-foreground" />
              </div>
              Income vs. Expenses
            </CardTitle>
            <CardDescription className="mt-2">
              Monthly financial flow with {chartData.length} months of data
            </CardDescription>
          </div>
          
          {/* Chart Controls */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-3 w-full sm:w-auto">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="income" className="text-xs">Income</TabsTrigger>
                <TabsTrigger value="expenses" className="text-xs">Expenses</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-1">
              <Button 
                variant={chartType === 'composed' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('composed')}
                className="px-2 py-1 h-8"
              >
                <BarChart3 className="h-3 w-3" />
              </Button>
              <Button 
                variant={chartType === 'area' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('area')}
                className="px-2 py-1 h-8"
              >
                <LineChart className="h-3 w-3" />
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setChartType('bar')}
                className="px-2 py-1 h-8"
              >
                <PieChart className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          <div className="bg-muted rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total Income</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(metrics.totalIncome)}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg: {formatCurrency(metrics.avgIncome)}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">Total Expenses</span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(metrics.totalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg: {formatCurrency(metrics.avgExpenses)}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1 rounded text-muted-foreground">
                {metrics.netBalance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Net Balance
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(metrics.netBalance)}
            </div>
          </div>

          <div className="bg-muted rounded-lg p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-xs font-medium text-muted-foreground">
                Savings Rate
              </div>
            </div>
            <div className="text-lg font-bold text-foreground">
              {metrics.savingsRate.toFixed(1)}%
            </div>
            <Badge variant="secondary" className="text-xs">
              {savingsRateStyles.label}
            </Badge>
          </div>
        </div>

        {/* Net Balance Toggle */}
        {viewMode === 'all' && (
          <div className="flex items-center justify-end mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNet(!showNet)}
              className="text-xs h-7 px-2"
            >
              {showNet ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
              Net Balance Line
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div style={{ height: chartConfig.height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={chartConfig.margin}>
              {/* Enhanced Gradients */}
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4B5563" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#6B7280" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#6B7280" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1F2937" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#374151" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#374151" stopOpacity={0.1}/>
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
                </filter>
              </defs>

              <CartesianGrid 
                strokeDasharray="2 4" 
                stroke="hsl(var(--border))" 
                opacity={0.3}
                horizontal={true}
                vertical={false}
              />
              
              <XAxis
                dataKey="name"
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: chartConfig.fontSize,
                  fontWeight: 500
                }}
                tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                interval={chartConfig.tickInterval}
                angle={windowWidth < 768 ? -45 : 0}
                textAnchor={windowWidth < 768 ? "end" : "middle"}
                height={windowWidth < 768 ? 60 : 40}
                padding={{ left: 10, right: 10 }}
              />
              
              <YAxis
                tick={{ 
                  fill: 'hsl(var(--muted-foreground))', 
                  fontSize: chartConfig.fontSize - 1
                }}
                tickFormatter={(value) => {
                  if (value === 0) return '₹0';
                  if (value >= 10000000) return `₹${(value/10000000).toFixed(1)}Cr`;
                  if (value >= 100000) return `₹${(value/100000).toFixed(1)}L`;
                  if (value >= 1000) return `₹${(value/1000).toFixed(0)}K`;
                  return `₹${value}`;
                }}
                tickLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                axisLine={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                width={chartConfig.margin.left}
              />
              
              <Tooltip content={<CustomTooltip viewMode={viewMode} showNet={showNet} />} />
              
              {viewMode !== 'expenses' && chartType !== 'bar' && (
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke={colors.income.primary}
                  strokeWidth={2.5}
                  fill={colors.income.gradient}
                  fillOpacity={chartType === 'area' ? 0.6 : 0.3}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#ffffff', 
                    strokeWidth: 2,
                    fill: colors.income.primary,
                    filter: 'url(#shadow)'
                  }}
                  animationBegin={0}
                  animationDuration={1500}
                />
              )}

              {viewMode !== 'income' && (
                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill={colors.expense.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={windowWidth < 768 ? 20 : 35}
                  animationBegin={200}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`expense-${entry.name}-${index}`} fill={colors.expense.primary} />
                  ))}
                </Bar>
              )}

              {viewMode !== 'expenses' && chartType === 'bar' && (
                <Bar
                  dataKey="income"
                  name="Income"
                  fill={colors.income.primary}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={windowWidth < 768 ? 20 : 35}
                  animationBegin={400}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`income-${entry.name}-${index}`} fill={colors.income.primary} />
                  ))}
                </Bar>
              )}

              {showNet && viewMode === 'all' && (
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net Balance"
                  stroke={colors.net.positive}
                  strokeWidth={3}
                  strokeDasharray={chartData.some(d => d.net < 0) ? "5 5" : "none"}
                  dot={{ 
                    r: 4, 
                    strokeWidth: 2,
                    fill: colors.net.positive
                  }}
                  activeDot={{ 
                    r: 7, 
                    stroke: '#ffffff', 
                    strokeWidth: 2,
                    fill: colors.net.positive,
                    filter: 'url(#shadow)'
                  }}
                  animationBegin={600}
                  animationDuration={1500}
                />
              )}

              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
                iconSize={12}
                align="center"
                verticalAlign="bottom"
                formatter={(value, entry) => LegendFormatter(value, entry, chartConfig.fontSize)}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export const IncomeExpenseChart = memo(IncomeExpenseChartComponent);
IncomeExpenseChart.displayName = 'IncomeExpenseChart';
