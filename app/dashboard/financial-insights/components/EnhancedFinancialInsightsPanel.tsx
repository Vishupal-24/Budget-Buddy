"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Target, 
  DollarSign, 
  Loader2, 
  PieChart,
  Filter,
  Grid3X3,
  List,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Equal
} from "lucide-react";
import { RealFinancialInsight, Transaction, Budget } from "@/lib/real-financial-insights";

interface EnhancedFinancialInsightsPanelProps {
  insights: RealFinancialInsight[];
  loading: boolean;
  onRefresh: () => void;
  transactions: Transaction[];
  budgets: Budget[];
  className?: string;
}

type ViewMode = 'grid' | 'list' | 'compact';
type FilterType = 'all' | 'high' | 'medium' | 'low' | 'actionable';
type SortType = 'priority' | 'type' | 'recent';

export function EnhancedFinancialInsightsPanel({ 
  insights, 
  loading, 
  onRefresh, 
  transactions,
  budgets,
  className = ""
}: Readonly<EnhancedFinancialInsightsPanelProps>) {
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('priority');
  const [expandedInsights, setExpandedInsights] = useState<Set<number>>(new Set());

  const getInsightIcon = (type: string) => {
    const iconClasses = "h-5 w-5";
    switch (type) {
      case 'warning':
      case 'budget_warning':
        return <AlertCircle className={`${iconClasses} text-muted-foreground`} />;
      case 'success':
        return <CheckCircle className={`${iconClasses} text-foreground`} />;
      case 'trend':
      case 'spending_pattern':
        return <TrendingUp className={`${iconClasses} text-foreground`} />;
      case 'decline':
        return <TrendingDown className={`${iconClasses} text-muted-foreground`} />;
      case 'budget_alert':
        return <Target className={`${iconClasses} text-foreground`} />;
      case 'category_analysis':
        return <PieChart className={`${iconClasses} text-foreground`} />;
      default:
        return <Info className={`${iconClasses} text-muted-foreground`} />;
    }
  };

  const getInsightPriority = (insight: RealFinancialInsight): 'high' | 'medium' | 'low' => {
    if (insight.type === 'budget_warning' || insight.type === 'warning') {
      return 'high';
    } else if (insight.type === 'spending_pattern' || insight.type === 'trend') {
      return 'medium';
    }
    return 'low';
  };

  const getInsightCardClasses = (insight: RealFinancialInsight, index: number) => {
    const baseClasses = "transition-colors cursor-pointer border";
    const priority = getInsightPriority(insight);
    const isSelected = selectedInsight === index;
    
    let colorClasses = isSelected 
      ? "border-foreground/30 bg-muted" 
      : "border-border bg-card hover:bg-muted/50";
    
    return `${baseClasses} ${colorClasses}`;
  };

  const getPriorityBadge = (insight: RealFinancialInsight) => {
    const priority = getInsightPriority(insight);
    
    const badgeConfig = {
      high: {
        color: "bg-muted text-foreground border-border",
        icon: <ArrowUpRight className="h-3 w-3" />
      },
      medium: {
        color: "bg-muted text-foreground border-border",
        icon: <Equal className="h-3 w-3" />
      },
      low: {
        color: "bg-muted text-foreground border-border",
        icon: <ArrowDownRight className="h-3 w-3" />
      }
    };
    
    const config = badgeConfig[priority];
    
    return (
      <Badge 
        variant="outline" 
        className={`${config.color} text-xs font-medium flex items-center gap-1`}
      >
        {config.icon}
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const isActionable = (insight: RealFinancialInsight) => {
    return insight.type === 'saving_suggestion' || insight.type === 'investment_tip';
  };

  const filteredAndSortedInsights = useMemo(() => {
    let filtered = insights;
    
    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'actionable') {
        filtered = insights.filter(isActionable);
      } else {
        filtered = insights.filter(insight => getInsightPriority(insight) === filterType);
      }
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortType) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[getInsightPriority(b)] - priorityOrder[getInsightPriority(a)];
        case 'type':
          return a.type.localeCompare(b.type);
        case 'recent':
        default:
          return 0; // Keep original order for now
      }
    });
    
    return filtered;
  }, [insights, filterType, sortType]);

  const insightStats = useMemo(() => {
    const stats = {
      high: insights.filter(i => getInsightPriority(i) === 'high').length,
      medium: insights.filter(i => getInsightPriority(i) === 'medium').length,
      low: insights.filter(i => getInsightPriority(i) === 'low').length,
      actionable: insights.filter(isActionable).length
    };
    return stats;
  }, [insights]);

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedInsights(newExpanded);
  };

  if (loading) {
    return (
      <Card className={`${className} border-0  bg-card`}>
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-6 w-6 text-muted-foreground" />
            <span className="text-foreground">Financial Insights</span>
          </CardTitle>
          <div className="h-4 w-80 rounded fast-skeleton" />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats overview skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/30">
                <div className="h-3 w-16 mb-2 rounded fast-skeleton" />
                <div className="h-6 w-12 rounded fast-skeleton" />
              </div>
            ))}
          </div>
          {/* Insight items skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
              <div className="h-10 w-10 rounded-lg fast-skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded fast-skeleton" />
                <div className="h-3 w-1/2 rounded fast-skeleton" />
              </div>
              <div className="h-6 w-16 rounded-full fast-skeleton" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className={`${className} border-0  bg-card`}>
        <CardHeader className="space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Financial Insights
                </span>
              </CardTitle>
              <p className="text-muted-foreground">
                AI-powered analysis of your financial patterns
              </p>
            </div>
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="mx-auto w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Ready to Generate Insights
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We need more financial data to provide meaningful insights about your spending patterns and financial health.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground max-w-sm mx-auto">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Add transactions to see spending patterns</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Target className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Set up budgets to get smart alerts</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Track activity for better insights</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with Controls */}
      <Card className="border bg-card">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-6 w-6 text-primary" />
                <span className="text-foreground">
                  Financial Insights
                </span>
              </CardTitle>
              <p className="text-muted-foreground">
                AI-powered analysis of your financial patterns • {filteredAndSortedInsights.length} insights
              </p>
            </div>
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div 
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                filterType === 'high' ? 'bg-muted border border-foreground/20' : 'bg-muted/50 hover:bg-muted'
              }`}
              onClick={() => setFilterType(filterType === 'high' ? 'all' : 'high')}
            >
              <div className="text-2xl font-bold text-foreground">{insightStats.high}</div>
              <div className="text-sm text-muted-foreground">High Priority</div>
            </div>
            <div 
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                filterType === 'medium' ? 'bg-muted border border-foreground/20' : 'bg-muted/50 hover:bg-muted'
              }`}
              onClick={() => setFilterType(filterType === 'medium' ? 'all' : 'medium')}
            >
              <div className="text-2xl font-bold text-foreground">{insightStats.medium}</div>
              <div className="text-sm text-muted-foreground">Medium Priority</div>
            </div>
            <div 
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                filterType === 'low' ? 'bg-muted border border-foreground/20' : 'bg-muted/50 hover:bg-muted'
              }`}
              onClick={() => setFilterType(filterType === 'low' ? 'all' : 'low')}
            >
              <div className="text-2xl font-bold text-foreground">{insightStats.low}</div>
              <div className="text-sm text-muted-foreground">Low Priority</div>
            </div>
            <div 
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                filterType === 'actionable' ? 'bg-muted border border-foreground/20' : 'bg-muted/50 hover:bg-muted'
              }`}
              onClick={() => setFilterType(filterType === 'actionable' ? 'all' : 'actionable')}
            >
              <div className="text-2xl font-bold text-foreground">{insightStats.actionable}</div>
              <div className="text-sm text-muted-foreground">Actionable</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-9"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-9"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
                className="h-9"
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value as SortType)}
                className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="priority">Sort by Priority</option>
                <option value="type">Sort by Type</option>
                <option value="recent">Sort by Recent</option>
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Insights Display */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredAndSortedInsights.map((insight, index) => {
            const originalIndex = insights.indexOf(insight);
            const isExpanded = expandedInsights.has(originalIndex);
            
            return (
              <Card 
                key={originalIndex} 
                className={getInsightCardClasses(insight, originalIndex)}
                onClick={() => toggleExpanded(originalIndex)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getInsightIcon(insight.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-foreground text-lg leading-tight">
                          {insight.title}
                        </h3>
                        <div className="flex items-center gap-2 ml-4">
                          {getPriorityBadge(insight)}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {insight.description}
                      </p>
                      
                      {insight.rawData && (
                        <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                          {insight.rawData.amount && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-background/60 dark:bg-background/40 rounded-lg border">
                              <DollarSign className="h-3 w-3 text-primary" />
                              <span className="font-medium">{formatAmount(insight.rawData.amount)}</span>
                            </div>
                          )}
                          {insight.rawData.percentage && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-background/60 dark:bg-background/40 rounded-lg border">
                              <TrendingUp className="h-3 w-3 text-primary" />
                              <span className="font-medium">{insight.rawData.percentage}%</span>
                            </div>
                          )}
                          {insight.rawData.trend && (
                            <Badge variant="secondary" className="text-xs">
                              {insight.rawData.trend}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {isExpanded && isActionable(insight) && (
                        <div className="mt-4 p-4 bg-transparent dark:bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                Recommended Action:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Consider implementing this suggestion to improve your financial health and reach your goals faster.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === 'list' && (
        <Card className="border-0  bg-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredAndSortedInsights.map((insight, index) => {
                const originalIndex = insights.indexOf(insight);
                const isExpanded = expandedInsights.has(originalIndex);
                
                return (
                  <div 
                    key={originalIndex}
                    className="p-6 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => toggleExpanded(originalIndex)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-foreground">
                            {insight.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-4">
                            {getPriorityBadge(insight)}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {insight.description}
                        </p>
                        
                        {isExpanded && insight.rawData && (
                          <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                            {insight.rawData.amount && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                                <DollarSign className="h-3 w-3 text-primary" />
                                <span>{formatAmount(insight.rawData.amount)}</span>
                              </div>
                            )}
                            {insight.rawData.percentage && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded">
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span>{insight.rawData.percentage}%</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'compact' && (
        <Card className="border-0  bg-card">
          <CardContent className="p-4">
            <div className="grid gap-3">
              {filteredAndSortedInsights.map((insight, index) => {
                const originalIndex = insights.indexOf(insight);
                
                return (
                  <div 
                    key={originalIndex}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedInsight(selectedInsight === originalIndex ? null : originalIndex)}
                  >
                    <div className="flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-foreground truncate text-sm">
                          {insight.title}
                        </h5>
                        {getPriorityBadge(insight)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAndSortedInsights.length === 0 && filterType !== 'all' && (
        <Card className="border-0  bg-card">
          <CardContent className="p-8 text-center">
            <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-2">No insights match your filter</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Try adjusting your filter settings or generating new insights.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterType('all')}
            >
              Clear Filter
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
