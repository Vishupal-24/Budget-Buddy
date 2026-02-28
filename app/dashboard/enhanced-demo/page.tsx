'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedFinancialOverview } from '@/components/dashboard/enhanced-financial-overview';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
}

export default function EnhancedDemoPage() {
  const [realTransactions, setRealTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real user transactions
  useEffect(() => {
    const fetchRealTransactions = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: transactions, error } = await supabase
          .from('transactions')
          .select(
            `
            id,
            amount,
            type,
            description,
            date,
            categories!inner(name)
          `
          )
          .eq('user_id', userData.user.id)
          .order('date', { ascending: false })
          .limit(10);

        if (error) throw error;

        const formattedTransactions =
          transactions?.map((t) => ({
            id: t.id,
            amount: t.amount,
            type: t.type as 'income' | 'expense',
            category: (t.categories as any)?.name || 'Uncategorized',
            date: t.date,
            description: t.description || '',
          })) || [];

        setRealTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching real transactions:', error);
        setRealTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealTransactions();
  }, []);
  const totalIncome = realTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = realTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="h-8 w-64 mb-3 rounded fast-skeleton" />
          <div className="h-4 w-96 rounded fast-skeleton" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-6 rounded-xl border bg-card">
              <div className="h-4 w-24 mb-3 rounded fast-skeleton" />
              <div className="h-8 w-32 mb-2 rounded fast-skeleton" />
              <div className="h-3 w-20 rounded fast-skeleton" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-80 w-full rounded-xl fast-skeleton" />
          <div className="h-64 w-full rounded-xl fast-skeleton" />
        </div>
      </div>
    );
  }

  if (realTransactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Enhanced Financial Overview</h1>
          <p className="text-muted-foreground mb-8">
            No transactions found. Add some transactions to see the enhanced financial overview.
          </p>
          <a
            href="/dashboard/transactions/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add Your First Transaction
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <EnhancedFinancialOverview
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        balance={balance}
        transactions={realTransactions}
        timeRange="January 2025"
        onRefresh={() => console.log('Refreshing data...')}
      />
    </div>
  );
}
