import React, { useState } from 'react';
import { Step, PlanItem } from '../types';
import { StepRenderer } from './StepRenderer';
import { Plus, Minus, Loader2, Layers, CheckCircle2, Circle, Edit3, RefreshCw, Save, X, ArrowRight } from './Icons';

interface StepListProps {
  items: PlanItem[];
  onExpandStep: (step: Step) => void;
  onResourceClick: (resourceName: string) => void;
  onToggleComplete: (step: Step) => void;
  onEditStep: (step: Step, newText: string, mode: 'save' | 'substeps' | 'future') => void;
  onRegenerateStep: (step: Step) => void;
  labels: {
    expand: string;
    collapse: string;
    simultaneous: string;
    edit: string;
    regenerate: string;
    save: string;
    cancel: string;
    postEditTitle: string;
    actionJustSave: string;
    actionSubsteps: string;
    actionFuture: string;
  };
}

export const StepList: React.FC<StepListProps> = ({
  items,
  onExpandStep,
  onResourceClick,
  onToggleComplete,
  onEditStep,
  onRegenerateStep,
  labels
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [postEditStep, setPostEditStep] = useState<Step | null>(null);

  const handleStartEdit = (step: Step) => {
    setEditingId(step.id);
    setEditValue(step.instruction);
    setPostEditStep(null);
  };

  const handleSaveEdit = (step: Step) => {
    if (editValue.trim() && editValue !== step.instruction) {
      setPostEditStep(step);
    } else {
      setEditingId(null);
    }
  };

  const handleModeSelection = (mode: 'save' | 'substeps' | 'future') => {
    if (postEditStep) {
      onEditStep(postEditStep, editValue, mode);
      setEditingId(null);
      setPostEditStep(null);
    }
  };

  const renderStep = (step: Step, index: number, isSubStep: boolean = false) => (
    <div key={step.id} className={`${isSubStep ? 'ml-12 mt-4' : 'mb-8'}`}>
      <div className={`group flex gap-4 ${step.loading ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="flex flex-col items-center">
          <button
            onClick={() => onToggleComplete(step)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.isCompleted
                ? 'bg-green-500 text-white shadow-lg shadow-green-200'
                : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-indigo-300 hover:text-indigo-400'
              }`}
          >
            {step.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
          {!isSubStep && items.indexOf(items.find(item =>
            item.type === 'single' ? item.step.id === step.id : item.group.steps.some(s => s.id === step.id)
          )!) !== items.length - 1 && (
              <div className="w-0.5 flex-grow bg-slate-100 my-2"></div>
            )}
        </div>

        <div className="flex-grow pt-1 pb-2">
          {editingId === step.id ? (
            <div className="bg-slate-50 p-4 rounded-xl border-2 border-indigo-100 animate-in zoom-in-95 duration-200">
              {!postEditStep ? (
                <>
                  <textarea
                    className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none h-24 text-slate-700 font-medium"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {labels.cancel}
                    </button>
                    <button
                      onClick={() => handleSaveEdit(step)}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {labels.save}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 py-2 text-center">
                  <h4 className="font-bold text-slate-800">{labels.postEditTitle}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => handleModeSelection('save')}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      {labels.actionJustSave}
                    </button>
                    <button
                      onClick={() => handleModeSelection('substeps')}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-indigo-500" /> {labels.actionSubsteps}
                    </button>
                    <button
                      onClick={() => handleModeSelection('future')}
                      className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" /> {labels.actionFuture}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className={`text-lg font-medium leading-relaxed transition-colors ${step.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  <StepRenderer text={step.instruction} onResourceClick={onResourceClick} />
                </div>
                {!postEditStep && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEdit(step)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all"
                      title={labels.edit}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRegenerateStep(step)}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-all"
                      title={labels.regenerate}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {step.loading && (
                <div className="flex items-center gap-2 mt-2 text-indigo-500 text-sm font-medium italic animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Updating step...
                </div>
              )}

              {step.subSteps && step.subSteps.length > 0 && (
                <button
                  onClick={() => onExpandStep(step)}
                  className="mt-3 flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
                >
                  {step.isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {step.isExpanded ? labels.collapse : labels.expand}
                </button>
              )}

              {!step.subSteps && !step.loading && (
                <button
                  onClick={() => onExpandStep(step)}
                  className="mt-3 flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase tracking-wider opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-4 h-4" /> {labels.expand}
                </button>
              )}

              {step.isExpanded && step.subSteps && (
                <div className="mt-4 space-y-2 border-l-2 border-indigo-50 pl-4 animate-in slide-in-from-left-2 duration-300">
                  {step.subSteps.map((sub, idx) => renderStep(sub, idx, true))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        if (item.type === 'single') {
          return renderStep(item.step, idx);
        } else {
          return (
            <div key={item.group.id} className="mb-12 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
              <div className="flex items-center gap-2 mb-6 text-indigo-700">
                <Layers className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">{labels.simultaneous}</span>
              </div>
              <div className="space-y-4">
                {item.group.steps.map((step, sIdx) => renderStep(step, sIdx))}
              </div>
            </div>
          );
        }
      })}
    </div>
  );
};