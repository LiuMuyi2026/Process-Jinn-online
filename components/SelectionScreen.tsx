import React from 'react';
import { ArrowRight } from './Icons';
import { Strategy } from '../types';

interface SelectionScreenProps {
    t: any;
    strategies: Strategy[];
    handleSelectStrategy: (id: string) => void;
    handleReset: () => void;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({
    t,
    strategies,
    handleSelectStrategy,
    handleReset
}) => {
    return (
        <div className="max-w-6xl mx-auto pt-8 space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold text-slate-900">{t.selectionTitle}</h2>
                <p className="text-slate-600 text-lg">{t.selectionSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {strategies.map((strategy, idx) => (
                    <div
                        key={strategy.id}
                        className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 flex flex-col h-full overflow-hidden cursor-pointer"
                        onClick={() => handleSelectStrategy(strategy.id)}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="p-8 flex-grow">
                            <div className="flex items-center gap-4 mb-6">
                                <span className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center text-lg font-bold border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                    {idx + 1}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                                    {strategy.title}
                                </h3>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                                {strategy.description}
                            </p>
                        </div>

                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 mt-auto">
                            <div className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-sm group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent transition-all flex items-center justify-center gap-2 shadow-sm">
                                {t.btnSelect} <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center">
                <button onClick={handleReset} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
                    {t.newGoal}
                </button>
            </div>
        </div>
    );
};
