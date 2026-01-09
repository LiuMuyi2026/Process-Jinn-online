import React from 'react';
import { Wand2, LogIn, LogOut, History } from './Icons';
import { Language } from '../types';

interface HeaderProps {
    t: any;
    language: Language;
    stage: string;
    user: any;
    handleReset: () => void;
    toggleLanguage: () => void;
    onShowHistory: () => void;
    onSignOut: () => void;
    onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
    t,
    language,
    stage,
    user,
    handleReset,
    toggleLanguage,
    onShowHistory,
    onSignOut,
    onOpenAuth
}) => {
    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
                    <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-1.5 rounded-lg text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
                        <Wand2 className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-indigo-600 transition-colors">{t.appTitle}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleLanguage}
                        className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors border border-transparent hover:border-indigo-100"
                    >
                        {language === 'en' ? '中文' : 'English'}
                    </button>

                    {stage !== 'INPUT' && stage !== 'PROCESSING' && (
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            {t.newGoal}
                        </button>
                    )}

                    <div className="h-6 w-px bg-slate-200"></div>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onShowHistory}
                                className="flex items-center gap-2 p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all"
                                title="My Plans"
                            >
                                <History className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                                    {user.email?.[0].toUpperCase()}
                                </div>
                                <button
                                    onClick={onSignOut}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={onOpenAuth}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-200"
                        >
                            <LogIn className="w-4 h-4" /> <span>Sign In</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
