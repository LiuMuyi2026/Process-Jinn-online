import { supabase } from '../supabase';
import { PlanItem, Resource, StoredPlan } from './types';

export const savePlan = async (
    userId: string,
    goal: string,
    strategyTitle: string,
    strategyDescription: string,
    planData: PlanItem[],
    resourcesData: Resource[]
) => {
    const { data, error } = await supabase
        .from('plans')
        .insert([
            {
                user_id: userId,
                goal,
                strategy_title: strategyTitle,
                strategy_description: strategyDescription,
                plan_data: planData,
                resources_data: resourcesData
            }
        ])
        .select();

    if (error) throw error;
    return data[0];
};

export const updateStepStatus = async (planId: string, planData: PlanItem[]) => {
    const { error } = await supabase
        .from('plans')
        .update({ plan_data: planData })
        .eq('id', planId);

    if (error) throw error;
};

export const getUserPlans = async (userId: string): Promise<StoredPlan[]> => {
    const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as StoredPlan[];
};

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};
