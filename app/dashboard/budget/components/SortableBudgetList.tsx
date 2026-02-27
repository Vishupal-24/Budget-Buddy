"use client";

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Budget, BudgetFilter, CategorySpending } from '../types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle, CheckCircle, GripVertical, Filter, TrendingUp, TrendingDown, Target, Clock, BarChart3, Rocket, Zap, Snail } from 'lucide-react';
import { motion } from 'framer-motion';

interface SortableBudgetItemProps {
  readonly budget: Budget;
  readonly categorySpending: CategorySpending | undefined;
  readonly onEdit: (budget: Budget) => void;
  readonly onDelete: (id: string) => void;
}

function SortableBudgetItem({ budget, categorySpending, onEdit, onDelete }: SortableBudgetItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: budget.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const percentage = categorySpending?.percentage || 0;

  const getProgressBarWidth = (percentage: number) => {
    return `${Math.min(percentage, 100)}%`;
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage > 100) return "bg-gradient-to-r from-muted to-muted";
    if (percentage > 85) return "bg-gradient-to-r from-muted to-muted";
    if (percentage > 70) return "bg-gradient-to-r from-muted to-muted";
    return "bg-gradient-to-r from-muted to-muted";
  };

  const getProgressBarGlow = (percentage: number) => {
    if (percentage > 100) return "shadow-red-500/25";
    if (percentage > 85) return "shadow-amber-500/25";
    if (percentage > 70) return "shadow-yellow-500/25";
    return "shadow-emerald-500/25";
  };

  const getMilestoneMarkers = (percentage: number) => {
    const milestones = [25, 50, 75, 90, 100];
    return milestones.filter((milestone: number) => milestone <= percentage);
  };

  const getSpendingVelocity = (percentage: number, daysInPeriod: number = 30) => {
    const dailyRate = percentage / daysInPeriod;
    if (dailyRate > 2) return { level: 'high', color: 'text-foreground', Icon: Rocket };
    if (dailyRate > 1) return { level: 'medium', color: 'text-foreground', Icon: Zap };
    return { level: 'low', color: 'text-foreground', Icon: Snail };
  };

  const getBudgetHealth = (percentage: number) => {
    if (percentage > 100) return { status: 'over', color: 'text-foreground', bgColor: 'bg-muted dark:bg-muted' };
    if (percentage > 90) return { status: 'warning', color: 'text-foreground', bgColor: 'bg-muted dark:bg-muted' };
    if (percentage > 75) return { status: 'caution', color: 'text-foreground', bgColor: 'bg-muted dark:bg-muted' };
    return { status: 'good', color: 'text-foreground', bgColor: 'bg-muted dark:bg-muted' };
  };

  const velocity = getSpendingVelocity(percentage);
  const health = getBudgetHealth(percentage);

  const getCategoryStatusIcon = (percentage: number) => {
    if (percentage > 100) {
      return <AlertTriangle className="h-4 w-4 text-foreground" />;
    } else if (percentage > 85) {
      return <AlertTriangle className="h-4 w-4 text-foreground" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-foreground" />;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-2xl mb-4 sm:mb-5 overflow-hidden shadow-md hover: transition-all duration-300 ${
        isDragging ? ' border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      } group cursor-pointer backdrop-blur-sm`}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="p-4 sm:p-5 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="touch-manipulation cursor-grab active:cursor-grabbing p-2.5 rounded-xl hover:bg-muted/50 transition-colors duration-200 border border-transparent hover:border-border"
              title="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            {getCategoryStatusIcon(percentage)}
            <h3 className="font-semibold text-lg line-clamp-1">{budget.category_name}</h3>
            {categorySpending && (
              <div className="flex items-center gap-2 ml-1">
                <span className={`text-base ${velocity.color}`}><velocity.Icon className="h-4 w-4" /></span>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${health.bgColor} ${health.color}`}>
                  {health.status}
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5 items-center">
            <div className="text-base font-semibold px-3.5 py-1.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
              {formatCurrency(budget.amount)}
              <span className="text-xs font-normal ml-1 opacity-70">budget</span>
            </div>
            {categorySpending && (
              <div className={`text-base font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap ${
                percentage > 100
                  ? "bg-muted text-foreground dark:bg-muted dark:text-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {formatCurrency(categorySpending.spent)}
                <span className="text-xs font-normal ml-1 opacity-70">spent</span>
              </div>
            )}
            {categorySpending && (
              <span
                className={`text-lg font-bold whitespace-nowrap ${
                  (() => {
                    if (percentage > 100) return "text-foreground dark:text-foreground";
                    if (percentage > 85) return "text-foreground dark:text-foreground";
                    return "text-foreground dark:text-foreground";
                  })()
                }`}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>

        {categorySpending && (
          <div className="relative h-4 bg-muted/30 rounded-full overflow-hidden mb-4 shadow-inner backdrop-blur-sm">
            {/* Background gradient for better depth */}
            <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-muted/20"></div>
            
            {/* Animated progress bar with enhanced styling */}
            <motion.div
              className={`h-full ${getProgressBarColor(percentage)} relative  ${getProgressBarGlow(percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: getProgressBarWidth(percentage) }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            >
              {/* Animated shine effect on the progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent opacity-0 animate-pulse"></div>
            </motion.div>
            
            {/* Enhanced milestone markers */}
            {getMilestoneMarkers(percentage).map((milestone) => (
              <div
                key={milestone}
                className="absolute top-1/2 h-2 w-2 bg-white rounded-full shadow-sm border-2 border-background transform -translate-y-1/2"
                style={{ left: `${milestone}%` }}
              />
            ))}
            
            {/* Enhanced current position indicator with pulse animation */}
            {percentage > 0 && (
              <motion.div
                className="absolute top-1/2 h-3 w-3 bg-white rounded-full  border-2 border-background transform -translate-y-1/2 -translate-x-1/2"
                initial={{ left: 0 }}
                animate={{ left: getProgressBarWidth(percentage) }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
              </motion.div>
            )}
            
            {/* 100% marker */}
            <div 
              className="absolute top-1/2 h-3 w-0.5 bg-foreground/30 transform -translate-y-1/2"
              style={{ left: '100%' }}
            ></div>
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary/30"></div>
            {categorySpending ? (
              (() => {
                const remaining = budget.amount - (categorySpending?.spent || 0);
                const isOverBudget = percentage > 100;
                
                return isOverBudget ? (
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-foreground" />
                    <span className="text-foreground dark:text-foreground font-medium">
                      {formatCurrency((categorySpending?.spent || 0) - budget.amount)} over budget
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-foreground" />
                    <span className="text-foreground dark:text-foreground font-medium">
                      {formatCurrency(remaining)} remaining
                    </span>
                  </div>
                );
              })()
            ) : (
              <span className="text-muted-foreground italic">No spending tracked</span>
            )}
          </div>
          
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-9 w-9 p-0 border-border hover:bg-accent transition-colors duration-200"
              aria-label={`Edit budget for ${budget.category_name}`}
              title={`Edit budget for ${budget.category_name}`}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(budget.id)}
              className="h-9 w-9 p-0 border-border hover:bg-accent text-foreground hover:text-foreground transition-colors duration-200"
              aria-label={`Delete budget for ${budget.category_name}`}
              title={`Delete budget for ${budget.category_name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface SortableBudgetListProps {
  readonly budgets: readonly Budget[];
  readonly categorySpending: readonly CategorySpending[];
  readonly onReorder: (newOrder: Budget[]) => void;
  readonly onEdit: (budget: Budget) => void;
  readonly onDelete: (id: string) => void;
}

export function SortableBudgetList({ budgets, categorySpending, onReorder, onEdit, onDelete }: SortableBudgetListProps) {
  const [activeFilter, setActiveFilter] = useState<BudgetFilter>('all');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = budgets.findIndex((budget) => budget.id === active.id);
      const newIndex = budgets.findIndex((budget) => budget.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBudgets = [...budgets]; // Create a mutable copy
        const [movedItem] = newBudgets.splice(oldIndex, 1);
        newBudgets.splice(newIndex, 0, movedItem);
        // Update with new order
        onReorder(newBudgets);
      }
    }
  };

  // Filter the budgets based on the active filter
  const filteredBudgets = budgets.filter(budget => {
    if (activeFilter === 'all') return true;
    
    const spendingForBudget = categorySpending.find(cat => cat.category_id === budget.category_id);
    
    if (!spendingForBudget) return activeFilter === 'under-budget'; // If no spending, count as under budget
    
    if (activeFilter === 'over-budget') {
      return spendingForBudget.percentage > 100;
    } else if (activeFilter === 'under-budget') {
      return spendingForBudget.percentage <= 100;
    }
    
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Enhanced Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 px-4 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-muted to-muted shadow-md flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Budget Progress
            </h3>
            <p className="text-sm text-muted-foreground">
              Track your spending against category budgets
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filter:</span>
          </div>
          <div className="flex border rounded-lg overflow-hidden shadow-sm">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="h-10 rounded-none px-3 text-sm font-medium border-0"
            >
              All
            </Button>
            <Button 
              variant={activeFilter === 'over-budget' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('over-budget')}
              className="h-10 rounded-none px-3 text-sm font-medium border-0"
            >
              Over Budget
            </Button>
            <Button 
              variant={activeFilter === 'under-budget' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveFilter('under-budget')}
              className="h-10 rounded-none px-3 text-sm font-medium border-0"
            >
              Under Budget
            </Button>
          </div>
        </div>
      </div>

      {/* Display empty state if no budgets match the filter */}
      {filteredBudgets.length === 0 ? (
        <div className="text-center p-8 sm:p-10 rounded-2xl border bg-card shadow-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-16 w-16 bg-muted rounded-full mx-auto flex items-center justify-center mb-5"
          >
            <Filter className="h-8 w-8 text-muted-foreground" />
          </motion.div>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-xl font-bold mb-2"
          >
            No matching budgets
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-muted-foreground mb-6 max-w-md mx-auto"
          >
            Try changing your filter selection or create a new budget to get started
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button 
              variant="outline" 
              onClick={() => setActiveFilter('all')}
              className="h-11 px-5 rounded-lg"
            >
              View All Budgets
            </Button>
          </motion.div>
        </div>
      ) : (
                  <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredBudgets.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                {filteredBudgets.map((budget) => (
                  <SortableBudgetItem
                    key={budget.id}
                    budget={budget}
                    categorySpending={categorySpending.find(cat => cat.category_id === budget.category_id)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
      )}
    </div>
  );
} 