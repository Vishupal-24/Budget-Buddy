"use client";

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { Budget, CategorySpending } from '../types';
import { supabase } from '@/lib/supabase';

interface BudgetGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category?: string;
  type: 'savings' | 'spending-limit' | 'category-target';
  color: string;
}

interface BudgetGoalsProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
}

const GOAL_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];

export function BudgetGoals({ budgets, categorySpending }: BudgetGoalsProps) {
  const [goals, setGoals] = useState<BudgetGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    type: 'savings' as const,
    category: ''
  });

  // Fetch goals from Supabase on mount
  useEffect(() => {
    async function fetchGoals() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['active', 'completed'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch goals:', error);
          return;
        }

        if (data) {
          setGoals(data.map((g: any, index: number) => ({
            id: g.id,
            title: g.title,
            targetAmount: Number(g.target_amount) || 0,
            currentAmount: Number(g.current_amount) || 0,
            deadline: g.deadline || '',
            category: g.category || undefined,
            type: g.category ? 'category-target' : 'savings',
            color: GOAL_COLORS[index % GOAL_COLORS.length],
          })));
        }
      } catch (err) {
        console.error('Failed to fetch goals:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchGoals();
  }, []);

  const goalStats = useMemo(() => {
    const completed = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    const inProgress = goals.filter(goal => 
      goal.currentAmount < goal.targetAmount && 
      new Date(goal.deadline) > new Date()
    ).length;
    const overdue = goals.filter(goal => 
      goal.currentAmount < goal.targetAmount && 
      new Date(goal.deadline) <= new Date()
    ).length;

    return { completed, inProgress, overdue, total: goals.length };
  }, [goals]);

  const handleAddGoal = async () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: newGoal.title,
          target_amount: parseFloat(newGoal.targetAmount),
          current_amount: 0,
          deadline: newGoal.deadline,
          category: newGoal.category || null,
          status: 'active',
          priority: 'medium',
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create goal:', error);
        return;
      }

      if (data) {
        const goal: BudgetGoal = {
          id: data.id,
          title: data.title,
          targetAmount: Number(data.target_amount),
          currentAmount: 0,
          deadline: data.deadline || '',
          type: newGoal.type,
          category: newGoal.category || undefined,
          color: GOAL_COLORS[goals.length % GOAL_COLORS.length],
        };
        setGoals([goal, ...goals]);
      }
    } catch (err) {
      console.error('Failed to create goal:', err);
    }

    setNewGoal({ title: '', targetAmount: '', deadline: '', type: 'savings', category: '' });
    setShowAddForm(false);
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) {
        console.error('Failed to delete goal:', error);
        return;
      }

      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const getGoalProgress = (goal: BudgetGoal) => {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const isCompleted = goal.currentAmount >= goal.targetAmount;
    const isOverdue = new Date(goal.deadline) <= new Date() && !isCompleted;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return { progress, isCompleted, isOverdue, daysLeft };
  };

  const getGoalStatusColor = (goal: BudgetGoal) => {
    const { isCompleted, isOverdue, progress } = getGoalProgress(goal);
    
    if (isCompleted) return 'text-foreground bg-muted border-border';
    if (isOverdue) return 'text-foreground bg-muted border-border';
    if (progress >= 75) return 'text-foreground bg-muted border-border';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="rounded-lg border bg-card  overflow-hidden mb-8">
      <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Budget Goals
            </h2>
            <p className="text-muted-foreground mt-1">
              Set and track your financial objectives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-md bg-transparent border border-border flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              className="h-10 px-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </div>

        {/* Goal Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{goalStats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{goalStats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{goalStats.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{goalStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Goals</div>
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-b bg-muted/20"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Add New Goal</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Title</label>
                  <Input
                    placeholder="e.g., Emergency Fund"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newGoal.targetAmount}
                    onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Deadline</label>
                  <Input
                    type="date"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Type</label>
                  <select
                    value={newGoal.type}
                    onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="savings">Savings Goal</option>
                    <option value="spending-limit">Spending Limit</option>
                    <option value="category-target">Category Target</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddGoal}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Goal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your goals...</p>
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No goals set yet</h3>
            <p className="text-muted-foreground mb-4">Start by creating your first financial goal</p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal, index) => {
              const { progress, isCompleted, isOverdue, daysLeft } = getGoalProgress(goal);
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`rounded-md border p-5 transition-all duration-300  ${getGoalStatusColor(goal)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`h-3 w-3 rounded-full ${goal.color} mt-1.5`}></div>
                      <div>
                        <h4 className="font-semibold text-sm">{goal.title}</h4>
                        {goal.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {goal.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => setEditingGoal(goal.id)}
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-foreground hover:text-foreground"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-medium">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className={`font-medium ${isCompleted ? 'text-foreground' : isOverdue ? 'text-foreground' : 'text-foreground'}`}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        className={`h-full rounded-full ${
                          isCompleted ? 'bg-muted' : 
                          isOverdue ? 'bg-muted' : 
                          progress >= 75 ? 'bg-muted' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Goal Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      {isCompleted ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-foreground" />
                          <span className="text-foreground font-medium">Completed!</span>
                        </>
                      ) : isOverdue ? (
                        <>
                          <AlertTriangle className="h-3 w-3 text-foreground" />
                          <span className="text-foreground font-medium">Overdue</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="h-3 w-3" />
                          <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}</span>
                        </>
                      )}
                    </div>
                    
                    <Badge 
                      variant="outline" 
                      className="text-xs capitalize"
                    >
                      {goal.type.replace('-', ' ')}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
