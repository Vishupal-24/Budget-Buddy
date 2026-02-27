"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { AnimatedCounter, AnimatedPercentage } from "@/components/ui/animated-counter";
import { 
  CreditCard, 
  Calculator, 
  Calendar, 
  Tag,
  TrendingUp,
  TrendingDown,
  Activity,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedMetrics {
  totalTransactions: number;
  averageTransactionAmount: number;
  mostActiveDay: string;
  mostActiveCategory: string;
  trends?: {
    transactions?: { value: number; isPositive: boolean };
    avgAmount?: { value: number; isPositive: boolean };
    dayActivity?: { value: number; isPositive: boolean };
    categoryActivity?: { value: number; isPositive: boolean };
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "green" | "purple" | "orange";
  description?: string;
}

const colorStyles = {
  blue: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground"
  },
  green: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground"
  },
  purple: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground"
  },
  orange: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground"
  }
};

function MetricCard({ title, value, icon, trend, color, description }: MetricCardProps) {
  const styles = colorStyles[color];
  
  return (
    <Card className={cn(
      "relative overflow-hidden border",
      styles.gradient,
      styles.border
    )}>
      <CardContent className="p-6">
        {/* Header with icon and trend */}
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-2.5 rounded-lg",
            styles.icon
          )}>
            {icon}
          </div>
          
          {trend && (
            <Badge 
              variant="secondary" 
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1",
                "bg-muted",
                "text-muted-foreground"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <AnimatedPercentage value={Math.abs(trend.value)} duration={800} />
            </Badge>
          )}
        </div>

        {/* Value */}
        <div className={cn(
          "text-2xl font-semibold mb-2",
          styles.value
        )}>
          {typeof value === 'number' && title.includes('Amount') ? (
            <AnimatedCounter value={value} isCurrency={true} duration={1200} />
          ) : typeof value === 'number' ? (
            <AnimatedCounter value={value} duration={1000} />
          ) : (
            value
          )}
        </div>

        {/* Title and description */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground/80">
              {description}
            </p>
          )}
        </div>

        {/* Subtle glow effect */}
      </CardContent>
    </Card>
  );
}

interface EnhancedMetricsCardsProps {
  metrics: EnhancedMetrics;
  className?: string;
}

const formatDay = (day: string) => {
  if (!day || day === 'N/A') return 'N/A';
  // Convert full day names to short forms
  const dayMap: Record<string, string> = {
    'Monday': 'Mon',
    'Tuesday': 'Tue', 
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };
  return dayMap[day] || day;
};

const formatCategory = (category: string) => {
  if (!category || category === 'N/A') return 'N/A';
  return category.length > 10 ? category.substring(0, 10) + '...' : category;
};

export function EnhancedMetricsCards({ metrics, className }: EnhancedMetricsCardsProps) {
  const formatValue = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      <MetricCard
        title="Total Transactions"
        value={formatValue(metrics.totalTransactions || 0)}
        icon={<CreditCard className="h-6 w-6" />}
        color="blue"
        trend={metrics.trends?.transactions}
        description="All time transactions"
      />
      
      <MetricCard
        title="Average Amount"
        value={formatCurrency(metrics.averageTransactionAmount || 0)}
        icon={<Calculator className="h-6 w-6" />}
        color="green"
        trend={metrics.trends?.avgAmount}
        description="Per transaction"
      />
      
      <MetricCard
        title="Most Active Day"
        value={formatDay(metrics.mostActiveDay)}
        icon={<Calendar className="h-6 w-6" />}
        color="purple"
        trend={metrics.trends?.dayActivity}
        description="Peak activity day"
      />
      
      <MetricCard
        title="Top Category"
        value={formatCategory(metrics.mostActiveCategory)}
        icon={<Tag className="h-6 w-6" />}
        color="orange"
        trend={metrics.trends?.categoryActivity}
        description="Most used category"
      />
    </div>
  );
}

// Alternative compact version for smaller screens
export function CompactMetricsCards({ metrics, className }: EnhancedMetricsCardsProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <Card className="bg-gradient-to-br from-muted to-muted dark:from-muted dark:to-muted border-border dark:border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted dark:bg-muted text-foreground dark:text-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground dark:text-foreground">
                {metrics.totalTransactions || 0}
              </div>
              <div className="text-xs text-muted-foreground">Transactions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-muted to-muted dark:from-muted dark:to-muted border-border dark:border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted dark:bg-muted text-foreground dark:text-foreground">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground dark:text-foreground">
                {formatCurrency(metrics.averageTransactionAmount || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-muted to-muted dark:from-muted dark:to-muted border-border dark:border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted dark:bg-muted text-foreground dark:text-foreground">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground dark:text-foreground">
                {formatDay(metrics.mostActiveDay)}
              </div>
              <div className="text-xs text-muted-foreground">Peak Day</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-muted to-muted dark:from-muted dark:to-muted border-border dark:border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-muted dark:bg-muted text-foreground dark:text-foreground flex-shrink-0">
              <Tag className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-lg font-bold text-foreground dark:text-foreground truncate" title={formatCategory(metrics.mostActiveCategory)}>
                {formatCategory(metrics.mostActiveCategory)}
              </div>
              <div className="text-xs text-muted-foreground truncate">Top Category</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}