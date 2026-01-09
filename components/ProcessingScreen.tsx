import React from 'react';
import { Wand2 } from './Icons';

interface ProcessingScreenProps {
    t: any;
    selectedStrategyId: string | null;
    loadingMessage: string;
}

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
    t,
    selectedStrategyId,
    loadingMessage
}) => {
    return (
        <div className="max-w-xl mx-auto pt-32 text-center animate-in fade-in duration-700">
            <div className="relative w-24 h-24 mx-auto mb-10">
                <div className="absolute inset-0 border-[6px] border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-[6px] border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-indigo-500 animate-pulse" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 min-h-[2rem]">
                {selectedStrategyId ? t.loadingPlan : loadingMessage}
            </h2>
            <p className="text-slate-500">
                {selectedStrategyId ? "" : "This might take a moment as we calculate the best path."}
            </p>
        </div>
    );
};
