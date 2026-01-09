import React, { useState, useRef, useEffect } from 'react';
import { generateStrategies, expandStep, generateResourcePlan, generateStrategyPlan, regenerateStepText, regenerateFutureSteps } from './services/geminiService';
import { GoalState, Step, Resource, PlanItem, Strategy, Language, StoredPlan } from './types';
import { AuthModal } from './components/AuthModal';
import { getTranslation } from './translations';
import { getUserPlans, signOut, savePlan, updateStepStatus, getSessionUser } from './services/dbService';

// Extracted Components
import { Header } from './components/Header';
import { InputScreen } from './components/InputScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { SelectionScreen } from './components/SelectionScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ProcessScreen } from './components/ProcessScreen';

const App: React.FC = () => {
  const [state, setState] = useState<GoalState>({
    description: '',
    quantification: '',
    environment: '',
    strategies: [],
    resources: [],
    selectedResourceId: null,
    selectedStrategyId: null,
    stage: 'INPUT',
    loading: false,
    error: null,
    language: 'en',
    user: null,
    history: [],
    selectedPlanId: null
  });

  const [copied, setCopied] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const t = getTranslation(state.language);

  const LOADING_MESSAGES = [
    t.loadingAnalyzing,
    t.loadingThinking,
    t.loadingStrategies,
    t.loadingResources,
    t.loadingFinalizing
  ];

  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  // Loading message cycler
  useEffect(() => {
    let interval: any;
    if (state.loading) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [state.loading, state.language]); // Reset when language changes

  // Check session on mount
  useEffect(() => {
    const user = getSessionUser();
    if (user) {
      setState(prev => ({ ...prev, user }));
      fetchHistory(user.id);
    }
  }, []);

  const fetchHistory = async (userId: string) => {
    try {
      const plans = await getUserPlans(userId);
      setState(prev => ({ ...prev, history: plans }));
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  // Sync with DB
  useEffect(() => {
    if (state.selectedPlanId && activeStrategy?.plan) {
      const timeout = setTimeout(() => {
        updateStepStatus(state.selectedPlanId!, activeStrategy.plan!);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [state.strategies, state.selectedPlanId]);

  // Scroll to top on stage change
  useEffect(() => {
    if (state.stage === 'SELECTION' || state.stage === 'PROCESS') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state.stage]);

  // --- Handlers ---

  const handleGenerate = async () => {
    if (!state.description.trim()) return;

    setState(prev => ({
      ...prev,
      loading: true,
      stage: 'PROCESSING',
      error: null,
      strategies: [],
      resources: [],
      selectedResourceId: null,
      selectedStrategyId: null
    }));

    try {
      const strategies = await generateStrategies(state.description, state.quantification, state.environment, state.language);

      setState(prev => ({
        ...prev,
        loading: false,
        stage: 'SELECTION',
        strategies,
        resources: [], // Resources are now found when plan is generated
      }));

    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        loading: false,
        stage: 'INPUT',
        error: t.errorGeneric
      }));
    }
  };

  const handleSelectStrategy = async (strategyId: string) => {
    const strategy = state.strategies.find(s => s.id === strategyId);
    if (!strategy) return;

    // Lazy load the plan if it doesn't exist OR if language has changed
    if (!strategy.plan || strategy.plan.length === 0 || strategy.planLanguage !== state.language) {
      setState(prev => ({ ...prev, loading: true, stage: 'PROCESSING' })); // Reuse processing screen briefly

      try {
        const plan = await generateStrategyPlan(strategy, state.description, state.environment, state.language);

        const newResources = extractResourcesFromPlan(plan);

        let savedPlanId = null;
        if (state.user) {
          try {
            const savedPlan = await savePlan(
              state.user.id,
              state.description,
              strategy.title,
              strategy.description,
              plan,
              newResources
            );
            savedPlanId = savedPlan.id;
            fetchHistory(state.user.id); // Refresh history
          } catch (err) {
            console.error("Failed to save plan:", err);
          }
        }

        setState(prev => ({
          ...prev,
          loading: false,
          stage: 'PROCESS',
          selectedStrategyId: strategyId,
          selectedPlanId: savedPlanId,
          resources: newResources,
          strategies: prev.strategies.map(s => s.id === strategyId ? { ...s, plan, planLanguage: state.language } : s)
        }));

      } catch (err) {
        console.error(err);
        setState(prev => ({
          ...prev,
          loading: false,
          stage: 'SELECTION',
          error: t.errorGeneric
        }));
      }

    } else {
      // Plan already exists and matches language
      setState(prev => ({
        ...prev,
        selectedStrategyId: strategyId,
        stage: 'PROCESS'
      }));
    }
  };

  const extractResourcesFromPlan = (plan: PlanItem[], existingResources: Resource[] = []): Resource[] => {
    const newResources: Resource[] = [...existingResources];
    const seenResources = new Set<string>(existingResources.map(r => r.name.toLowerCase()));

    const addResource = (resName: string) => {
      const cleanName = resName.replace(/[\[\]]/g, '').trim();
      if (cleanName && !seenResources.has(cleanName.toLowerCase())) {
        seenResources.add(cleanName.toLowerCase());
        newResources.push({
          id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: cleanName,
          isExpanded: false,
          language: state.language
        });
      }
    };

    plan.forEach(item => {
      if (item.type === 'single') {
        item.step.resources.forEach(addResource);
      } else {
        item.group.steps.forEach(s => s.resources.forEach(addResource));
      }
    });
    return newResources;
  };

  const handleReset = () => {
    setState(prev => ({
      ...prev,
      stage: 'INPUT',
      strategies: [],
      resources: [],
      description: '',
      quantification: '',
      environment: ''
    }));
  };

  const handleBackToSelection = () => {
    setState(prev => ({
      ...prev,
      stage: 'SELECTION',
      selectedStrategyId: null
    }));
  };

  // --- New Handlers for Edit/Check/Regenerate ---

  const handleToggleComplete = (step: Step) => {
    updateStepInState(step.id, { isCompleted: !step.isCompleted });
  };

  const handleRegenerateStep = async (step: Step) => {
    updateStepInState(step.id, { loading: true });
    try {
      const context = `${state.description} ${state.environment}`;
      const result = await regenerateStepText(step.instruction, context, state.language);

      updateStepInState(step.id, {
        loading: false,
        instruction: result.instruction,
        resources: result.resources,
        subSteps: undefined, // Clear old substeps
        isExpanded: false
      });

      // Add new resources if found
      if (result.resources.length > 0) {
        setState(prev => ({
          ...prev,
          resources: extractResourcesFromPlan([{ type: 'single', step: { ...step, resources: result.resources } }], prev.resources)
        }));
      }
    } catch (e) {
      console.error(e);
      updateStepInState(step.id, { loading: false });
    }
  };

  const handleEditStep = async (step: Step, newText: string, mode: 'save' | 'substeps' | 'future') => {
    // 1. Update the text immediately in the state
    const regex = /\[(.*?)\]/g;
    const foundResources: string[] = [];
    let match;
    while ((match = regex.exec(newText)) !== null) {
      foundResources.push(match[1]);
    }

    updateStepInState(step.id, {
      instruction: newText,
      resources: foundResources
    });

    // 2. Handle specific modes
    if (mode === 'substeps') {
      // Trigger expand (regenerate steps to achieve this)
      const activeStrategy = state.strategies.find(s => s.id === state.selectedStrategyId);
      if (activeStrategy) {
        performExpandStep({ ...step, instruction: newText, resources: foundResources }, activeStrategy.title);
      }
    } else if (mode === 'future') {
      handleRegenerateFuture(step.id, newText);
    } else {
      // Just save - updates resources if any new ones were found in the text
      if (foundResources.length > 0) {
        setState(prev => ({
          ...prev,
          resources: extractResourcesFromPlan([{ type: 'single', step: { ...step, instruction: newText, resources: foundResources } }], prev.resources)
        }));
      }
    }
  };

  const handleRegenerateFuture = async (stepId: string, currentText: string) => {
    const activeStrategy = state.strategies.find(s => s.id === state.selectedStrategyId);
    if (!activeStrategy || !activeStrategy.plan) return;

    // Find index of the edited step
    const planIndex = activeStrategy.plan.findIndex(item =>
      item.type === 'single' ? item.step.id === stepId : item.group.steps.some(s => s.id === stepId)
    );

    // If it's the last step, we can't really "regenerate future steps" (nothing follows)
    if (planIndex === -1 || planIndex === activeStrategy.plan.length - 1) return;

    const itemsToRegenerateCount = activeStrategy.plan.length - 1 - planIndex;

    // Exclude current step from history to avoid confusion, passing it as 'currentStep' specifically to the AI
    const contextSteps = activeStrategy.plan.slice(0, planIndex).map(item => {
      if (item.type === 'single') return item.step.instruction;
      return item.group.steps.map(s => s.instruction).join(" AND ");
    });

    // Show loading on subsequent steps AND ensure the current step text is updated in this state push
    // (activeStrategy is stale, so we must manually set currentText)
    const updatedPlanLoading = activeStrategy.plan.map((item, idx) => {
      if (idx === planIndex) {
        if (item.type === 'single') {
          return { ...item, step: { ...item.step, instruction: currentText } };
        } else {
          return {
            ...item,
            group: {
              ...item.group,
              steps: item.group.steps.map(s => s.id === stepId ? { ...s, instruction: currentText } : s)
            }
          };
        }
      }

      if (idx > planIndex) {
        if (item.type === 'single') return { ...item, step: { ...item.step, loading: true } };
        // Simplified: parallel groups loading could be added here
        return item;
      }
      return item;
    });

    setState(prev => ({
      ...prev,
      strategies: prev.strategies.map(s => s.id === state.selectedStrategyId ? { ...s, plan: updatedPlanLoading } : s)
    }));

    try {
      const newFutureItems = await regenerateFutureSteps(state.description, contextSteps, currentText, itemsToRegenerateCount, state.language);

      // Reconstruct the plan:
      // 1. Items before the edited step (unchanged)
      const stepsBefore = activeStrategy.plan.slice(0, planIndex);

      // 2. The edited step itself (must include the NEW text, as activeStrategy is stale)
      const pivotItem = activeStrategy.plan[planIndex];
      let newPivotItem = { ...pivotItem };
      if (newPivotItem.type === 'single') {
        newPivotItem.step = { ...newPivotItem.step, instruction: currentText };
      } else {
        newPivotItem.group = {
          ...newPivotItem.group,
          steps: newPivotItem.group.steps.map(s => s.id === stepId ? { ...s, instruction: currentText } : s)
        };
      }

      // 3. The newly generated future items
      const finalPlan = [...stepsBefore, newPivotItem, ...newFutureItems];

      setState(prev => ({
        ...prev,
        strategies: prev.strategies.map(s => s.id === state.selectedStrategyId ? { ...s, plan: finalPlan } : s),
        resources: extractResourcesFromPlan(newFutureItems, prev.resources)
      }));

    } catch (e) {
      console.error(e);
      // Revert loading state, preserving the text edit by using prev state
      setState(prev => ({
        ...prev,
        strategies: prev.strategies.map(s => {
          if (s.id !== state.selectedStrategyId || !s.plan) return s;
          return {
            ...s,
            plan: s.plan.map(item => {
              if (item.type === 'single') return { ...item, step: { ...item.step, loading: false } };
              return item;
            })
          };
        })
      }));
    }
  };

  const handleExpandStep = async (targetStep: Step, contextStrategyTitle: string) => {
    if (targetStep.subSteps && targetStep.subSteps.length > 0) {
      updateStepInState(targetStep.id, { isExpanded: !targetStep.isExpanded });
      return;
    }
    performExpandStep(targetStep, contextStrategyTitle);
  };

  const performExpandStep = async (targetStep: Step, contextStrategyTitle: string) => {
    updateStepInState(targetStep.id, { loading: true });

    try {
      const envContext = state.environment ? ` [Environment: ${state.environment}]` : '';
      const context = `${state.description}${envContext} (Strategy: ${contextStrategyTitle})`;
      const subSteps = await expandStep(targetStep.instruction, context, state.language);

      // Update resources
      let updatedResources = [...state.resources];
      const seen = new Set(updatedResources.map(r => r.name.toLowerCase()));
      subSteps.forEach(s => {
        s.resources.forEach(r => {
          const clean = r.replace(/[\[\]]/g, '').trim();
          if (clean && !seen.has(clean.toLowerCase())) {
            seen.add(clean.toLowerCase());
            updatedResources.push({
              id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: clean,
              isExpanded: false,
              language: state.language
            });
          }
        });
      });

      setState(prev => ({
        ...prev,
        resources: updatedResources
      }));

      updateStepInState(targetStep.id, {
        loading: false,
        isExpanded: true,
        subSteps
      });
    } catch (err) {
      console.error(err);
      updateStepInState(targetStep.id, { loading: false });
    }
  };

  const handleResourceClick = (resourceName: string) => {
    const cleanName = resourceName.replace(/[\[\]]/g, '').trim();
    const existing = state.resources.find(r => r.name.toLowerCase() === cleanName.toLowerCase());

    if (existing) {
      setState(prev => ({ ...prev, selectedResourceId: existing.id }));
      // If acquisition steps missing OR language mismatch, fetch
      if (!existing.acquisitionSteps || existing.language !== state.language) {
        handleFetchResourcePlan(existing.id, existing.name);
      }
    } else {
      const newRes: Resource = {
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: cleanName,
        isExpanded: true,
        loading: true,
        language: state.language
      };

      setState(prev => ({
        ...prev,
        resources: [newRes, ...prev.resources],
        selectedResourceId: newRes.id
      }));

      generateResourcePlan(cleanName, state.language).then(steps => {
        updateResourceInState(newRes.id, { loading: false, acquisitionSteps: steps, language: state.language });
      });
    }
  };

  const handleFetchResourcePlan = async (resourceId: string, resourceName: string) => {
    updateResourceInState(resourceId, { loading: true });
    try {
      const steps = await generateResourcePlan(resourceName, state.language);
      updateResourceInState(resourceId, { loading: false, acquisitionSteps: steps, language: state.language });
    } catch (e) {
      updateResourceInState(resourceId, { loading: false });
    }
  };

  const updateStepInState = (stepId: string, updates: Partial<Step>) => {
    setState(prev => {
      const newStrategies = prev.strategies.map(strat => {
        if (!strat.plan) return strat;

        const processSteps = (steps: Step[]): Step[] => {
          return steps.map(step => {
            if (step.id === stepId) return { ...step, ...updates };
            if (step.subSteps) return { ...step, subSteps: processSteps(step.subSteps) };
            return step;
          });
        };

        const newPlan = strat.plan.map((item): PlanItem => {
          if (item.type === 'single') {
            if (item.step.id === stepId) {
              return { ...item, step: { ...item.step, ...updates } };
            }
            if (item.step.subSteps) {
              return { ...item, step: { ...item.step, subSteps: processSteps(item.step.subSteps) } };
            }
            return item;
          } else {
            const updatedGroupSteps = processSteps(item.group.steps);
            return { ...item, group: { ...item.group, steps: updatedGroupSteps } };
          }
        });

        return { ...strat, plan: newPlan };
      });
      return { ...prev, strategies: newStrategies };
    });
  };

  const updateResourceInState = (resId: string, updates: Partial<Resource>) => {
    setState(prev => ({
      ...prev,
      resources: prev.resources.map(r => r.id === resId ? { ...r, ...updates } : r)
    }));
  };

  const toggleLanguage = () => {
    setState(prev => ({
      ...prev,
      language: prev.language === 'en' ? 'zh' : 'en',
      error: null
    }));
  };

  const generatePlainText = () => {
    if (!activeStrategy) return '';

    let text = `${t.appTitle} Plan\n\n`;
    text += `${t.labelGoal}: ${state.description}\n`;
    if (state.quantification) text += `${t.labelSpecifics}: ${state.quantification}\n`;
    if (state.environment) text += `${t.labelEnvironment}: ${state.environment}\n`;
    text += `\n--------------------------------\n\n`;

    text += `${t.headerSelected}: ${activeStrategy.title}\n`;
    text += `${activeStrategy.description}\n\n`;

    text += `${t.headerRoadmap}:\n`;

    activeStrategy.plan?.forEach((item, idx) => {
      if (item.type === 'single') {
        const check = item.step.isCompleted ? '[x]' : '[ ]';
        text += `${idx + 1}. ${check} ${item.step.instruction}\n`;
        if (item.step.subSteps) {
          item.step.subSteps.forEach((sub) => {
            const subCheck = sub.isCompleted ? '[x]' : '[ ]';
            text += `   - ${subCheck} ${sub.instruction}\n`;
          });
        }
      } else {
        text += `${idx + 1}. ${t.simultaneous}:\n`;
        item.group.steps.forEach((step) => {
          const check = step.isCompleted ? '[x]' : '[ ]';
          text += `   - ${check} ${step.instruction}\n`;
          if (step.subSteps) {
            step.subSteps.forEach((sub) => {
              const subCheck = sub.isCompleted ? '[x]' : '[ ]';
              text += `     * ${subCheck} ${sub.instruction}\n`;
            });
          }
        });
      }
    });

    if (state.resources.length > 0) {
      text += `\n--------------------------------\n\n`;
      text += `${t.headerResources}:\n`;
      state.resources.forEach(res => {
        text += `\n[${res.name}]\n`;
        if (res.acquisitionSteps) {
          res.acquisitionSteps.forEach((step, idx) => {
            text += `${idx + 1}. ${step.instruction}\n`;
          });
        } else {
          text += `(Plan not generated yet)\n`;
        }
      });
    }

    return text;
  };

  const handleCopyPlan = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadPlan = () => {
    const text = generatePlainText();
    const element = document.createElement("a");
    const file = new Blob([text], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "process-jinn-plan.md";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };


  // --- Render Sections ---


  const activeStrategy = state.strategies.find(s => s.id === state.selectedStrategyId);
  const selectedResource = state.resources.find(r => r.id === state.selectedResourceId) || null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        t={t}
        language={state.language}
        stage={state.stage}
        user={state.user}
        handleReset={handleReset}
        toggleLanguage={toggleLanguage}
        onShowHistory={() => setState(prev => ({ ...prev, stage: 'HISTORY' }))}
        onSignOut={() => { signOut(); setState(prev => ({ ...prev, user: null })); }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {state.stage === 'INPUT' && (
          <InputScreen
            t={t}
            description={state.description}
            quantification={state.quantification}
            environment={state.environment}
            error={state.error}
            onDescriptionChange={(val) => setState(prev => ({ ...prev, description: val }))}
            onQuantificationChange={(val) => setState(prev => ({ ...prev, quantification: val }))}
            onEnvironmentChange={(val) => setState(prev => ({ ...prev, environment: val }))}
            onGenerate={handleGenerate}
          />
        )}

        {state.stage === 'PROCESSING' && (
          <ProcessingScreen
            t={t}
            selectedStrategyId={state.selectedStrategyId}
            loadingMessage={LOADING_MESSAGES[loadingMsgIndex]}
          />
        )}

        {state.stage === 'SELECTION' && (
          <SelectionScreen
            t={t}
            strategies={state.strategies}
            handleSelectStrategy={handleSelectStrategy}
            handleReset={handleReset}
          />
        )}

        {state.stage === 'PROCESS' && (
          <ProcessScreen
            t={t}
            activeStrategy={activeStrategy}
            selectedResource={selectedResource}
            copied={copied}
            handleBackToSelection={handleBackToSelection}
            handleCopyPlan={handleCopyPlan}
            handleDownloadPlan={handleDownloadPlan}
            handleResourceClick={handleResourceClick}
            handleExpandStep={(step) => handleExpandStep(step, activeStrategy?.title || '')}
            handleToggleComplete={handleToggleComplete}
            handleEditStep={handleEditStep}
            handleRegenerateStep={handleRegenerateStep}
            onCloseResourcePanel={() => setState(prev => ({ ...prev, selectedResourceId: null }))}
          />
        )}

        {state.stage === 'HISTORY' && (
          <HistoryScreen
            history={state.history}
            onSelectPlan={(plan) => {
              setState(prev => ({
                ...prev,
                stage: 'PROCESS',
                description: plan.goal,
                selectedStrategyId: 'loaded',
                selectedPlanId: plan.id,
                strategies: [{
                  id: 'loaded',
                  title: plan.strategy_title,
                  description: plan.strategy_description,
                  plan: plan.plan_data,
                }],
                resources: plan.resources_data
              }));
            }}
            onGoToPlanner={handleReset}
          />
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => setState(prev => ({ ...prev, user }))}
      />
    </div>
  );
};

export default App;

