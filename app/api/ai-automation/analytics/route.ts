import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Save daily performance analytics
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();
    const {
      clienteId,
      publishedContentId,
      analysisDate,
      contentType,
      topic,
      platform,
      reach,
      engagementRate,
      performanceScore,
      whatWorked,
      whatFailed,
      recommendation,
    } = body;

    const { data, error } = await supabase
      .from('performance_analytics')
      .insert({
        cliente_id: clienteId,
        published_content_id: publishedContentId,
        analysis_date: analysisDate,
        content_type: contentType,
        topic,
        platform,
        reach,
        engagement_rate: engagementRate,
        performance_score: performanceScore,
        what_worked: JSON.stringify(whatWorked),
        what_failed: JSON.stringify(whatFailed),
        recommendation,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Analytics recorded',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET analytics summary for client
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(req.url);
    const clienteId = searchParams.get('clienteId');
    const days = parseInt(searchParams.get('days') || '7');

    // Get analytics for last N days
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('performance_analytics')
      .select('*')
      .eq('cliente_id', clienteId)
      .gte('analysis_date', fromDate.toISOString().split('T')[0])
      .order('analysis_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate summary
    const summary = {
      totalPosts: data?.length || 0,
      avgEngagementRate:
        data && data.length > 0
          ? (
              data.reduce((sum: number, item: any) => sum + (item.engagement_rate || 0), 0) /
              data.length
            ).toFixed(2)
          : 0,
      excellentPosts: data?.filter((item: any) => item.performance_score === 'EXCELLENT')
        .length || 0,
      goodPosts: data?.filter((item: any) => item.performance_score === 'GOOD').length || 0,
      needsWorkPosts: data?.filter(
        (item: any) => item.performance_score === 'NEEDS_WORK'
      ).length || 0,
      topContentType: data && data.length > 0
        ? Object.entries(
            data.reduce((acc: any, item: any) => {
              acc[item.content_type] = (acc[item.content_type] || 0) + 1;
              return acc;
            }, {})
          ).sort(([, a]: any, [, b]: any) => b - a)[0][0]
        : null,
    };

    return NextResponse.json({
      data,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
