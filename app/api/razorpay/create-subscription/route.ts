import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const Razorpay = (await import('razorpay')).default;
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create a subscription plan first if needed, or use existing plan_id
    // For simplicity, we create a one-time order here instead of a subscription
    // Replace PLAN_ID with your Razorpay plan ID
    const subscription = await (razorpay.subscriptions as unknown as {
      create: (opts: Record<string, unknown>) => Promise<{ id: string }>;
    }).create({
      plan_id: process.env.RAZORPAY_PLAN_ID || 'plan_default',
      customer_notify: 1,
      quantity: 1,
      total_count: 12, // 12 months
    });

    return NextResponse.json({ subscription_id: subscription.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create subscription';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
