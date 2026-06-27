import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// AI Automation API: Save Strategic Plan
// POST /api/ai-automation/strategic-plan
// Body: { clienteId, mese, pillars, toneVoice, segments, ... }

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const {
      clienteId,
      mese,
      pillar1,
      pillar1Desc,
      pillar2,
      pillar2Desc,
      pillar3,
      pillar3Desc,
      pillar4,
      pillar4Desc,
      toneVoice,
      primaryAudience,
      segment1,
      segment2,
      segment3,
      seasonalFocus,
      instagramTime1,
      instagramTime2,
      tiktokTime1,
      tiktokTime2,
      facebookTime,
    } = body;

    // Save to DB
    const { data, error } = await supabase
      .from('strategic_plans')
      .insert({
        cliente_id: clienteId,
        mese,
        pillar_1: pillar1,
        pillar_1_desc: pillar1Desc,
        pillar_2: pillar2,
        pillar_2_desc: pillar2Desc,
        pillar_3: pillar3,
        pillar_3_desc: pillar3Desc,
        pillar_4: pillar4,
        pillar_4_desc: pillar4Desc,
        tone_voice: toneVoice,
        primary_audience: primaryAudience,
        segment_1: segment1,
        segment_2: segment2,
        segment_3: segment3,
        seasonal_focus: seasonalFocus,
        instagram_time_1: instagramTime1,
        instagram_time_2: instagramTime2,
        tiktok_time_1: tiktokTime1,
        tiktok_time_2: tiktokTime2,
        facebook_time: facebookTime,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Strategic plan for ${mese} saved successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET strategic plan
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');
    const mese = searchParams.get('mese');

    const { data, error } = await supabase
      .from('strategic_plans')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('mese', mese)
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      data: data || null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
