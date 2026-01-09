import { PlanItem, Resource, StoredPlan } from '../types';

// Storage keys
const STORAGE_KEYS = {
    USERS: 'jinn_users',
    PLANS: 'jinn_plans',
    SESSION: 'jinn_session'
};

// Helper to get from local storage
const getStored = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setStored = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const signUp = async (email: string, password: string) => {
    const users = getStored(STORAGE_KEYS.USERS);
    if (users.find((u: any) => u.email === email)) {
        throw new Error('User already exists');
    }

    const newUser = { id: crypto.randomUUID(), email, password };
    users.push(newUser);
    setStored(STORAGE_KEYS.USERS, users);

    // Auto-login
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(newUser));
    return { user: newUser };
};

export const signIn = async (email: string, password: string) => {
    const users = getStored(STORAGE_KEYS.USERS);
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    return { user };
};

export const signOut = async () => {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
};

export const getSessionUser = () => {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    return session ? JSON.parse(session) : null;
};

export const savePlan = async (
    userId: string,
    goal: string,
    strategyTitle: string,
    strategyDescription: string,
    planData: PlanItem[],
    resourcesData: Resource[]
) => {
    const plans = getStored(STORAGE_KEYS.PLANS);
    const newPlan: StoredPlan = {
        id: crypto.randomUUID(),
        user_id: userId,
        goal,
        strategy_title: strategyTitle,
        strategy_description: strategyDescription,
        plan_data: planData,
        resources_data: resourcesData,
        created_at: new Date().toISOString()
    };

    plans.push(newPlan);
    setStored(STORAGE_KEYS.PLANS, plans);
    return newPlan;
};

export const updateStepStatus = async (planId: string, planData: PlanItem[]) => {
    const plans = getStored(STORAGE_KEYS.PLANS);
    const index = plans.findIndex((p: any) => p.id === planId);
    if (index !== -1) {
        plans[index].plan_data = planData;
        setStored(STORAGE_KEYS.PLANS, plans);
    }
};

export const getUserPlans = async (userId: string): Promise<StoredPlan[]> => {
    const plans = getStored(STORAGE_KEYS.PLANS);
    return plans.filter((p: any) => p.user_id === userId).sort((a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
};
