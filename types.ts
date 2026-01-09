export type Language = 'en' | 'zh';

export interface Resource {
  id: string;
  name: string;
  isExpanded: boolean;
  acquisitionSteps?: Step[];
  loading?: boolean;
  language?: Language;
}

export interface Step {
  id: string;
  instruction: string; // Plain text with [Resource] bracket notation from AI
  resources: string[]; // List of resource names found in this step
  subSteps?: Step[];
  isExpanded?: boolean;
  isCompleted?: boolean;
  loading?: boolean;
}

export interface ParallelGroup {
  id: string;
  steps: Step[];
}

export type PlanItem =
  | { type: 'single'; step: Step }
  | { type: 'parallel'; group: ParallelGroup };

export interface Strategy {
  id: string;
  title: string;
  description: string;
  plan?: PlanItem[]; // Optional for lazy loading
  planLoading?: boolean;
  planLanguage?: Language;
}

export type AppStage = 'INPUT' | 'PROCESSING' | 'SELECTION' | 'PROCESS' | 'HISTORY';

export interface GoalState {
  description: string;
  quantification: string;
  environment: string;
  strategies: Strategy[];
  resources: Resource[];
  selectedResourceId: string | null;
  selectedStrategyId: string | null;
  stage: AppStage;
  loading: boolean;
  error: string | null;
  language: Language;
  user: any | null; // Supabase User type would be better but keeping it simple for now
  history: StoredPlan[];
  selectedPlanId: string | null;
}

export interface StoredPlan {
  id: string;
  user_id: string;
  goal: string;
  strategy_title: string;
  strategy_description: string;
  plan_data: PlanItem[];
  resources_data: Resource[];
  created_at: string;
}
