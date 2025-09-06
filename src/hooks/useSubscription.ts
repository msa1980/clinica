import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserSubscription {
  id: string;
  user_id: string;
  monthly_fee_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'EXPIRED';
  activated_at: string;
  expires_at: string | null;
  monthly_fee: {
    value: number;
    description: string;
    next_due_date: string;
    status: string;
  };
}

export const useSubscription = (user: User | null) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setHasAccess(false);
      return;
    }

    checkSubscription();
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          monthly_fee:monthly_fee_id (
            value,
            description,
            next_due_date,
            status
          )
        `)
        .eq('user_id', user?.id)
        .eq('status', 'ACTIVE')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking subscription:', error);
        setHasAccess(false);
        setSubscription(null);
        return;
      }

      if (data) {
        setSubscription(data);
        // Check if subscription is still valid (not expired)
        const now = new Date();
        const nextDueDate = new Date(data.monthly_fee.next_due_date);
        const isValid = nextDueDate > now && data.status === 'ACTIVE';

        setHasAccess(isValid);

        // If subscription is expired, update status
        if (!isValid && data.status === 'ACTIVE') {
          await supabase
            .from('user_subscriptions')
            .update({ status: 'EXPIRED' })
            .eq('id', data.id);
        }
      } else {
        setSubscription(null);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setHasAccess(false);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    if (user) {
      setLoading(true);
      checkSubscription();
    }
  };

  return {
    subscription,
    loading,
    hasAccess,
    refreshSubscription
  };
};