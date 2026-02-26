import { useMemo } from 'react';
import { Freight, StandaloneExpense } from '@/lib/types';
import { DollarSign, Wrench, MessageSquare, Trash2 } from 'lucide-react';

export type ActivityItem = {
    id: string;
    type: 'revenue' | 'expense' | 'deletion' | 'update';
    title: string;
    date: Date;
    amount: number;
    status: string;
    link: string | null;
    color: 'success' | 'destructive' | 'info' | 'warning' | 'muted';
    iconType: 'revenue' | 'expense' | 'message' | 'delete';
};

export function useActivity(freight: Freight[], expenses: StandaloneExpense[]) {
    return useMemo(() => {
        let activity: ActivityItem[] = [];

        // 1. Freight & Linked Data
        freight.forEach(item => {
            // A. Deliveries (Revenue)
            if (item.status === 'Delivered') {
                activity.push({
                    id: `rev-${item.id}`,
                    type: 'revenue',
                    title: `Freight #${item.freightId} - ${item.origin} to ${item.destination}`,
                    date: new Date(item.date),
                    amount: item.ownerAmount ?? 0,
                    status: item.status,
                    link: `/freight-ledger?edit=${item.id}`,
                    color: 'success',
                    iconType: 'revenue'
                });
            }

            // B. Load-Linked Expenses
            if (item.expenses) {
                item.expenses.forEach(exp => {
                    activity.push({
                        id: `exp-${exp.id}`,
                        type: 'expense',
                        title: `${exp.category}: ${exp.description} (Load #${item.freightId})`,
                        date: exp.date ? new Date(exp.date) : new Date(item.date),
                        amount: -exp.amount,
                        status: item.status === 'Cancelled' ? 'Void' : 'Paid',
                        link: `/freight-ledger?edit=${item.id}`,
                        color: 'destructive',
                        iconType: 'expense'
                    });
                });
            }

            // C. Comments/Updates on Freight
            if (item.comments) {
                item.comments.forEach(comment => {
                    activity.push({
                        id: `com-${comment.id}`,
                        type: 'update',
                        title: `${comment.type === 'system' ? 'System' : 'Note'} on Load #${item.freightId}: ${comment.text}`,
                        date: new Date(comment.timestamp),
                        amount: 0,
                        status: 'Note',
                        link: `/freight-ledger?edit=${item.id}`,
                        color: 'info',
                        iconType: 'message'
                    });
                });
            }

        });

        // 2. Standalone Expenses
        expenses.forEach(exp => {
            // Active Expense
            activity.push({
                id: `std-exp-${exp.id}`,
                type: 'expense',
                title: `${exp.category}: ${exp.description} (${exp.driverName ? 'Driver: ' + exp.driverName : exp.assetName ? 'Asset: ' + exp.assetName : 'Overhead'})`,
                date: new Date(exp.date),
                amount: -exp.amount,
                status: 'Paid',
                link: '/expenses', // Note: Deep linking to edit standalone expense might require more work, sticking to page for now
                color: 'destructive',
                iconType: 'expense'
            });

            // Standalone Expense Comments
            if (exp.comments) {
                exp.comments.forEach(comment => {
                    activity.push({
                        id: `std-com-${comment.id}`,
                        type: 'update',
                        title: `${comment.type === 'system' ? 'System' : 'Note'} on Expense '${exp.description}': ${comment.text}`,
                        date: new Date(comment.timestamp),
                        amount: 0,
                        status: 'Note',
                        link: '/expenses',
                        color: 'info',
                        iconType: 'message'
                    });
                });
            }
        });

        // Sort Global Activity by Date Descending
        return activity.sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [freight, expenses]);
}
