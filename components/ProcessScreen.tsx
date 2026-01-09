import React from 'react';
import { ArrowLeft, Check, Copy, Download, Layers } from './Icons';
import { StepList } from './StepList';
import { ResourcePanel } from './ResourcePanel';
import { Strategy, Resource, Step } from '../types';

interface ProcessScreenProps {
    t: any;
    activeStrategy: Strategy | undefined;
    selectedResource: Resource | null;
    copied: boolean;
    handleBackToSelection: () => void;
    handleCopyPlan: () => void;
    handleDownloadPlan: () => void;
    handleResourceClick: (name: string) => void;
    handleExpandStep: (step: Step) => void;
    handleToggleComplete: (step: Step) => void;
    handleEditStep: (step: Step, text: string, mode: 'save' | 'substeps' | 'future') => void;
    handleRegenerateStep: (step: Step) => void;
    onCloseResourcePanel: () => void;
}

export const ProcessScreen: React.FC<ProcessScreenProps> = ({
    t,
    activeStrategy,
    selectedResource,
    copied,
    handleBackToSelection,
    handleCopyPlan,
    handleDownloadPlan,
    handleResourceClick,
    handleExpandStep,
    handleToggleComplete,
    handleEditStep,
    handleRegenerateStep,
    onCloseResourcePanel
}) => {
    if (!activeStrategy || !activeStrategy.plan) return null;

    const isPanelOpen = !!selectedResource;

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <button
                    onClick={handleBackToSelection}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm px-4 py-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200"
                >
                    <ArrowLeft className="w-4 h-4" /> {t.btnBack}
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={handleCopyPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? t.copied : t.btnCopy}
                    </button>
                    <button
                        onClick={handleDownloadPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all shadow-sm hover:shadow"
                    >
                        <Download className="w-4 h-4" />
                        {t.btnSave}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative transition-all duration-300">
                <div className={`${isPanelOpen ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-6 transition-all duration-500`}>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-slate-100 bg-slate-50/30">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">{t.headerSelected}</span>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-3">{activeStrategy.title}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">{activeStrategy.description}</p>

                            {!isPanelOpen && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 max-w-fit">
                                    <Layers className="w-4 h-4 text-blue-500" />
                                    <span>{t.resourceTip} <span className="font-semibold text-indigo-600">Blue Pills</span> {t.resourceTip3}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-8 text-slate-400 font-semibold uppercase text-xs tracking-wider">
                                <Layers className="w-4 h-4" /> {t.headerRoadmap}
                            </div>
                            <StepList
                                items={activeStrategy.plan}
                                onExpandStep={handleExpandStep}
                                onResourceClick={handleResourceClick}
                                onToggleComplete={handleToggleComplete}
                                onEditStep={handleEditStep}
                                onRegenerateStep={handleRegenerateStep}
                                labels={{
                                    expand: t.expand,
                                    collapse: t.collapse,
                                    simultaneous: t.simultaneous,
                                    edit: t.edit,
                                    regenerate: t.regenerate,
                                    save: t.save,
                                    cancel: t.cancel,
                                    postEditTitle: t.postEditTitle,
                                    actionJustSave: t.actionJustSave,
                                    actionSubsteps: t.actionSubsteps,
                                    actionFuture: t.actionFuture
                                }}
                            />
                        </div>
                    </div>
                </div>

                {isPanelOpen && (
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <ResourcePanel
                                resource={selectedResource}
                                onResourceClick={handleResourceClick}
                                onClose={onCloseResourcePanel}
                                labels={{
                                    acquisitionPlan: t.acquisitionPlan,
                                    generating: t.generating
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
