import React from 'react';
import { History, Calendar, Wand2 } from './Icons';
import { StoredPlan } from '../types';

interface HistoryScreenProps {
    history: StoredPlan[];
    onSelectPlan: (plan: StoredPlan) => void;
    onGoToPlanner: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
    history,
    onSelectPlan,
    onGoToPlanner
}) => {
    return (
        <div className="max-w-4xl mx-auto pt-8 space-y-10 animate-in fade-in duration-500">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
                    <History className="w-8 h-8 text-indigo-500" /> My Saved Plans
                </h2>
                <p className="text-slate-600 text-lg">Revisit and track your previously generated execution paths.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {history.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No saved plans yet. Start by defining a goal!</p>
                        <button
                            onClick={onGoToPlanner}
                            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all"
                        >
                            Go to Planner
                        </button>
                    </div>
                ) : (
                    history.map(plan => (
                        <div
                            key={plan.id}
                            onClick={() => onSelectPlan(plan)}
                            className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/30 transition-all cursor-pointer group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{plan.strategy_title}</h3>
                                    <p className="text-slate-500 text-sm flex items-center gap-1.5">
                                        <Wand2 className="w-3.5 h-3.5" /> Goal: {plan.goal}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Created</span>
                                    <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        {new Date(plan.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-4">
                                {plan.plan_data.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <div
                                            className={`h-full bg-green-500 transition-all duration-1000 ${(item.type === 'single' ? item.step.isCompleted : item.group.steps.every(s => s.isCompleted)) ? 'w-full' : 'w-0'
                                                }`}
                                        />
                                    </div>
                                ))}
                                {plan.plan_data.length > 3 && <div className="text-[10px] font-bold text-slate-300">+{plan.plan_data.length - 3} MORE</div>}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="text-center pt-8">
                <button onClick={onGoToPlanner} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
                    ← Back to selection
                </button>
            </div>
        </div>
    );
};
