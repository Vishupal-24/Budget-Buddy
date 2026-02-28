"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, DollarSign, Wallet, PiggyBank, Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  type: "income" | "expense" | "balance" | "savings";
  className?: string;
}

const CARD_STYLES = {
  income: {
    icon: "text-foreground",
    iconBg: "bg-muted",
    value: "text-foreground",
  },
  expense: {
    icon: "text-foreground",
    iconBg: "bg-muted",
    value: "text-foreground",
  },
  balance: {
    icon: "text-foreground",
    iconBg: "bg-muted",
    value: "text-foreground",
  },
  savings: {
    icon: "text-foreground",
    iconBg: "bg-muted",
    value: "text-foreground",
  }
};

export function EnhancedStatsCard({ title, value, icon, trend, type, className }: StatsCardProps) {
  const styles = CARD_STYLES[type];
  
  return (
    <div>
      <Card className={cn(
        "relative overflow-hidden border bg-card",
        className
      )}>
        <CardContent className="p-6">
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-4">
            <div className={cn(
              "p-2.5 rounded-lg",
              styles.iconBg,
              styles.icon
            )}>
              {icon}
            </div>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md",
                "bg-muted text-muted-foreground"
              )}>
                {trend.isPositive ? (
                  <TrendingUpIcon className="h-3 w-3" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">
            {title}
          </h3>

          {/* Value */}
          <div className={cn("text-2xl font-semibold mb-2", styles.value)}>
            {formatCurrency(value)}
          </div>

          {/* Trend details */}
          {trend && (
            <p className="text-xs text-muted-foreground">
              {trend.isPositive ? "+" : ""}{trend.value}% from {trend.period}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface EnhancedStatsGridProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate?: number;
  trends?: {
    income?: { value: number; isPositive: boolean };
    expense?: { value: number; isPositive: boolean };
    balance?: { value: number; isPositive: boolean };
  };
}

export function EnhancedStatsGrid({ 
  totalIncome, 
  totalExpense, 
  balance, 
  savingsRate = 0,
  trends 
}: EnhancedStatsGridProps) {
  const savings = totalIncome - totalExpense;
  const savingsPercentage = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  
  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <EnhancedStatsCard
        title="Total Income"
        value={totalIncome}
        icon={<ArrowUpIcon className="h-6 w-6" />}
        type="income"
        trend={trends?.income ? { ...trends.income, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Total Expenses"
        value={totalExpense}
        icon={<ArrowDownIcon className="h-6 w-6" />}
        type="expense"
        trend={trends?.expense ? { ...trends.expense, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Current Balance"
        value={balance}
        icon={<Wallet className="h-6 w-6" />}
        type="balance"
        trend={trends?.balance ? { ...trends.balance, period: "last month" } : undefined}
      />
      
      <EnhancedStatsCard
        title="Monthly Savings"
        value={savings}
        icon={<PiggyBank className="h-6 w-6" />}
        type="savings"
        trend={savingsPercentage > 0 ? { 
          value: Math.round(savingsPercentage), 
          isPositive: savingsPercentage > 0, 
          period: "of income" 
        } : undefined}
      />
    </div>
  );
}
