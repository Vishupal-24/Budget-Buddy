"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowUpIcon, ArrowDownIcon, Calendar, Filter, Eye, TrendingUp, TrendingDown, MoreHorizontal, Search, UtensilsCrossed, Car, Film, ShoppingBag, Zap, Heart, DollarSign, Briefcase, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { FastTransactionSkeleton } from "@/components/ui/fast-skeleton";

interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description?: string;
}

interface EnhancedRecentTransactionsProps {
  transactions: Transaction[];
  showFilters?: boolean;
  maxItems?: number;
  loading?: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "dining out": { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  food: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  transport: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  entertainment: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  shopping: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  utilities: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  healthcare: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  salary: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  freelance: { 
    bg: "bg-muted", 
    text: "text-foreground"
  },
  default: { 
    bg: "bg-muted", 
    text: "text-muted-foreground"
  }
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "dining out": UtensilsCrossed,
  food: UtensilsCrossed,
  transport: Car,
  entertainment: Film,
  shopping: ShoppingBag,
  utilities: Zap,
  healthcare: Heart,
  salary: DollarSign,
  freelance: Briefcase,
  default: BarChart3,
};

function TransactionItem({ transaction, index }: { transaction: Transaction; index: number }) {
  const isIncome = transaction.type === "income";
  const categoryKey = transaction.category.toLowerCase();
  const categoryStyle = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;
  const IconComponent = CATEGORY_ICONS[categoryKey] || CATEGORY_ICONS.default;
  
  return (
    <div className="group relative">
      <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors bg-card">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Category icon */}
          <div className={cn(
            "flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-lg",
            categoryStyle.bg
          )}>
            <span className="text-base"><IconComponent className="h-4 w-4" /></span>
          </div>
          
          {/* Transaction details */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-foreground capitalize text-sm truncate">
                {transaction.category}
              </h4>
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0 font-medium flex-shrink-0"
              >
                {isIncome ? "Income" : "Expense"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(new Date(transaction.date))}</span>
            </div>
            {transaction.description && (
              <p className="text-xs text-muted-foreground truncate max-w-48">
                {transaction.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Amount */}
        <div className="text-right">
          <div className={cn(
            "font-semibold text-sm",
            "text-foreground"
          )}>
            {isIncome ? "+" : "-"}{formatCurrency(transaction.amount)}
          </div>
          <div className="text-xs text-muted-foreground">
            {isIncome ? "Received" : "Spent"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnhancedRecentTransactions({ 
  transactions, 
  showFilters = true, 
  maxItems = 5,
  loading = false
}: EnhancedRecentTransactionsProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        const matchesFilter = filter === "all" || t.type === filter;
        const matchesSearch = searchTerm === "" || 
          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesFilter && matchesSearch;
      })
      .slice(0, maxItems);
  }, [transactions, filter, searchTerm, maxItems]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => {
      return sum + (t.type === "income" ? t.amount : -t.amount);
    }, 0);
  }, [filteredTransactions]);

  if (loading) {
    return <FastTransactionSkeleton />;
  }

  const filterButtons = [
    { key: "all" as const, label: "All", count: transactions.length },
    { key: "income" as const, label: "Income", count: transactions.filter(t => t.type === "income").length },
    { key: "expense" as const, label: "Expenses", count: transactions.filter(t => t.type === "expense").length }
  ];

  return (
    <Card>
      <CardHeader className="pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Recent Transactions</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredTransactions.length} of {transactions.length} transactions
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Net Total</div>
                <div className={cn(
                  "font-bold text-lg",
                  totalAmount >= 0 ? "text-foreground" : "text-foreground"
                )}>
                  {totalAmount >= 0 ? "+" : ""}{formatCurrency(Math.abs(totalAmount))}
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm">
                <Link href="/dashboard/transactions" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View All
                </Link>
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Filter buttons */}
              <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl backdrop-blur-sm">
                {filterButtons.map((btn) => (
                  <Button
                    key={btn.key}
                    variant={filter === btn.key ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(btn.key)}
                    className={cn(
                      "h-8 px-4 text-xs font-medium transition-all duration-200",
                      filter === btn.key 
                        ? "shadow-sm" 
                        : "hover:bg-background/80"
                    )}
                  >
                    {btn.label}
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                      {btn.count}
                    </Badge>
                  </Button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 pl-10 pr-4 text-sm bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {filteredTransactions.length > 0 ? (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mb-6">
                {searchTerm ? (
                  <Search className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <Filter className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-semibold text-xl mb-2">
                {searchTerm ? "No matching transactions" : "No transactions found"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {searchTerm 
                  ? `No transactions match "${searchTerm}". Try adjusting your search.`
                  : filter === "all" 
                    ? "Start by adding your first transaction to see it here" 
                    : `No ${filter} transactions found for the selected period`}
              </p>
              <div className="flex gap-3">
                {searchTerm && (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                )}
                <Button asChild className="shadow-sm">
                  <Link href="/dashboard/transactions/new">
                    Add Transaction
                  </Link>
                </Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}