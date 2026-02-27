"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Target,
  BarChart3,
  Eye,
  EyeOff,
  Sparkles
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

interface PremiumMetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: "blue" | "green" | "purple" | "orange";
  description?: string;
  isAnimated?: boolean;
}

const premiumColorStyles = {
  blue: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground",
    glow: ""
  },
  green: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground",
    glow: ""
  },
  purple: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground",
    glow: ""
  },
  orange: {
    gradient: "bg-card",
    border: "border-border",
    icon: "text-foreground bg-muted",
    value: "text-foreground",
    trend: "text-muted-foreground",
    glow: ""
  }
};

function PremiumMetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  color, 
  description, 
  isAnimated = true 
}: PremiumMetricCardProps) {
  const styles = premiumColorStyles[color];
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden border",
        styles.gradient,
        styles.border
      )}
    >
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
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 text-muted-foreground"
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              <AnimatedPercentage value={Math.abs(trend.value)} duration={1000} />
            </Badge>
          )}
        </div>

        {/* Value */}
        <div className={cn(
          "text-2xl font-semibold mb-2",
          styles.value
        )}>
          {isAnimated && typeof value === 'number' && title.includes('Amount') ? (
            <AnimatedCounter value={value} isCurrency={true} duration={1500} />
          ) : isAnimated && typeof value === 'number' ? (
            <AnimatedCounter value={value} duration={1200} />
          ) : (
            value
          )}
        </div>

        {/* Title and description */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground/80">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface PremiumMetricsSectionProps {
  metrics: EnhancedMetrics;
  className?: string;
}

export function PremiumMetricsSection({ metrics, className }: PremiumMetricsSectionProps) {
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [showTrends, setShowTrends] = useState(true);

  const formatCategory = (category: string) => {
    if (!category || category === 'N/A') return 'N/A';
    return category.length > 12 ? category.substring(0, 12) + '...' : category;
  };

  const formatDay = (day: string) => {
    if (!day || day === 'N/A') return 'N/A';
    const dayMap: Record<string, string> = {
      'Monday': 'Monday',
      'Tuesday': 'Tuesday', 
      'Wednesday': 'Wednesday',
      'Thursday': 'Thursday',
      'Friday': 'Friday',
      'Saturday': 'Saturday',
      'Sunday': 'Sunday'
    };
    return dayMap[day] || day;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Financial Metrics</h2>
            <p className="text-sm text-muted-foreground">Key performance indicators</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTrends(!showTrends)}
            className="flex items-center gap-2"
          >
            {showTrends ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            Trends
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "detailed" ? "compact" : "detailed")}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {viewMode === "detailed" ? "Compact" : "Detailed"}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className={cn(
        "grid gap-6 transition-all duration-500",
        viewMode === "detailed" 
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" 
          : "grid-cols-2 lg:grid-cols-4"
      )}>
        <PremiumMetricCard
          title="Total Transactions"
          value={metrics.totalTransactions || 0}
          icon={<CreditCard className="h-7 w-7" />}
          color="blue"
          trend={showTrends ? metrics.trends?.transactions : undefined}
          description="All recorded transactions"
          isAnimated={true}
        />
        
        <PremiumMetricCard
          title="Average Amount"
          value={metrics.averageTransactionAmount || 0}
          icon={<Calculator className="h-7 w-7" />}
          color="green"
          trend={showTrends ? metrics.trends?.avgAmount : undefined}
          description="Mean transaction value"
          isAnimated={true}
        />
        
        <PremiumMetricCard
          title="Peak Activity Day"
          value={formatDay(metrics.mostActiveDay)}
          icon={<Calendar className="h-7 w-7" />}
          color="purple"
          trend={showTrends ? metrics.trends?.dayActivity : undefined}
          description="Most transactions recorded"
          isAnimated={false}
        />
        
        <PremiumMetricCard
          title="Top Category"
          value={formatCategory(metrics.mostActiveCategory)}
          icon={<Tag className="h-7 w-7" />}
          color="orange"
          trend={showTrends ? metrics.trends?.categoryActivity : undefined}
          description="Most frequently used"
          isAnimated={false}
        />
      </div>
    </div>
  );
}