import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Save editorial plan (28 days)
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const { clienteId, strategicPlanId, weekNumber, planDate, days } = body;

    // Insert editorial plan header
    const { data: planData, error: planError } = await supabase
      .from('editorial_plans')
      .insert({
        cliente_id: clienteId,
        strategic_plan_id: strategicPlanId,
        week_number: weekNumber,
        plan_date: planDate,
      })
      .select()
      .single();

    if (planError) {
      return NextResponse.json({ error: planError.message }, { status: 400 });
    }

    // Insert days
    const daysWithPlanId = days.map((day: any) => ({
      ...day,
      editorial_plan_id: planData.id,
      cliente_id: clienteId,
    }));

    const { data: daysData, error: daysError } = await supabase
      .from('editorial_plan_days')
      .insert(daysWithPlanId)
      .select();

    if (daysError) {
      return NextResponse.json({ error: daysError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { plan: planData, days: daysData },
      message: `Editorial plan for week ${weekNumber} saved`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET editorial plan for a client
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');

    const { data, error } = await supabase
      .from('editorial_plan_days')
      .select('*')
      .eq('cliente_id', clienteId)
      .gte('plan_date', new Date().toISOString().split('T')[0])
      .order('plan_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
