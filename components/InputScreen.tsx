import React from 'react';
import { ArrowRight } from './Icons';

interface InputScreenProps {
    t: any;
    description: string;
    quantification: string;
    environment: string;
    error: string | null;
    onDescriptionChange: (val: string) => void;
    onQuantificationChange: (val: string) => void;
    onEnvironmentChange: (val: string) => void;
    onGenerate: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({
    t,
    description,
    quantification,
    environment,
    error,
    onDescriptionChange,
    onQuantificationChange,
    onEnvironmentChange,
    onGenerate
}) => {
    return (
        <div className="max-w-2xl mx-auto space-y-8 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                    {t.inputTitle}
                </h2>
                <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                    {t.inputSubtitle}
                </p>
            </div>

            <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="goal" className="block text-sm font-semibold text-slate-700">{t.labelGoal}</label>
                        <textarea
                            id="goal"
                            placeholder={t.placeholderGoal}
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none h-32 text-lg placeholder:text-slate-400"
                            value={description}
                            onChange={(e) => onDescriptionChange(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="quantification" className="block text-sm font-semibold text-slate-700">{t.labelSpecifics} <span className="text-slate-400 font-normal">{t.labelOptional}</span></label>
                            <input
                                id="quantification"
                                type="text"
                                placeholder={t.placeholderSpecifics}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={quantification}
                                onChange={(e) => onQuantificationChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="environment" className="block text-sm font-semibold text-slate-700">{t.labelEnvironment} <span className="text-slate-400 font-normal">{t.labelOptional}</span></label>
                            <input
                                id="environment"
                                type="text"
                                placeholder={t.placeholderEnvironment}
                                className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                value={environment}
                                onChange={(e) => onEnvironmentChange(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={onGenerate}
                        disabled={!description.trim()}
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {t.btnGenerate} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 text-sm text-center rounded-b-2xl border-t border-red-100">
                        {error}
                    </div>
                )}
            </div>

            <div className="text-center">
                <p className="sm:text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">{t.examplesLabel}</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {t.examples.map(ex => (
                        <button
                            key={ex}
                            onClick={() => onDescriptionChange(ex)}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
                        >
                            {ex}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
