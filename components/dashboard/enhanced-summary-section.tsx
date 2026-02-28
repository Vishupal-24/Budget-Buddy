"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SummaryData {
  totalAmount: number;
  categories: number;
  period: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  topCategory?: {
    name: string;
    amount: number;
    percentage: number;
  };
}

interface EnhancedSummarySectionProps {
  data: SummaryData;
  type: "income" | "expense";
}

export function EnhancedSummarySection({ data, type }: EnhancedSummarySectionProps) {
  const isIncome = type === "income";
  
  const colorScheme = {
    income: {
      gradient: "bg-card border",
      text: "text-foreground",
      badge: "bg-muted text-muted-foreground",
      icon: "text-foreground",
      accent: "text-muted-foreground"
    },
    expense: {
      gradient: "bg-card border",
      text: "text-foreground",
      badge: "bg-muted text-muted-foreground",
      icon: "text-foreground",
      accent: "text-muted-foreground"
    }
  };

  const scheme = colorScheme[type];

  return (
    <div>
      <Card className={cn(
        "relative overflow-hidden",
        scheme.gradient
      )}>
        <CardContent className="p-6">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-muted">
                  {isIncome ? (
                    <TrendingUp className={cn("h-5 w-5", scheme.icon)} />
                  ) : (
                    <TrendingDown className={cn("h-5 w-5", scheme.icon)} />
                  )}
                </div>
                <div>
                  <h2 className={cn("text-base font-semibold", scheme.text)}>
                    {isIncome ? "Total Income" : "Total Expenses"}
                  </h2>
                  <p className={cn("text-xs", scheme.accent)}>
                    {data.period}
                  </p>
                </div>
              </div>

              {data.trend && (
                <Badge className={cn("px-2 py-0.5 text-xs", scheme.badge)}>
                  {data.trend.isPositive ? "+" : ""}{data.trend.value}%
                </Badge>
              )}
            </div>

            {/* Main amount */}
            <div className="mb-4">
              <div className={cn("text-2xl font-semibold mb-1", scheme.text)}>
                {formatCurrency(data.totalAmount)}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Target className={cn("h-3.5 w-3.5", scheme.accent)} />
                  <span className={cn("text-xs", scheme.accent)}>
                    {data.categories} {data.categories === 1 ? "Category" : "Categories"}
                  </span>
                </div>
                {data.topCategory && (
                  <div className="flex items-center gap-1.5">
                    <Zap className={cn("h-3.5 w-3.5", scheme.accent)} />
                    <span className={cn("text-xs", scheme.accent)}>
                      Top: {data.topCategory.name} ({data.topCategory.percentage}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom stats */}
            {data.topCategory && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <div className={cn("text-xs", scheme.accent)}>
                    Highest Category
                  </div>
                  <div className={cn("text-sm font-medium", scheme.text)}>
                    {data.topCategory.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className={cn("text-xs", scheme.accent)}>
                    Amount
                  </div>
                  <div className={cn("text-sm font-medium", scheme.text)}>
                    {formatCurrency(data.topCategory.amount)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
