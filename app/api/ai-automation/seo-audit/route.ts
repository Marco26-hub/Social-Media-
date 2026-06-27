// app/api/ai-automation/seo-audit/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const {
      cliente_id,
      seo_score,
      page_speed_score,
      mobile_score,
      ux_score,
      total_keywords,
      ranking_1_10,
      ranking_11_50,
      ranking_51_100,
      top_keywords,
      organic_traffic,
      organic_traffic_change,
      critical_issues,
      warnings,
      opportunities,
      opportunities_list,
    } = await req.json()

    // Determine health status
    const seo_health =
      seo_score >= 80
        ? 'EXCELLENT'
        : seo_score >= 60
          ? 'GOOD'
          : 'NEEDS_WORK'

    const { data, error } = await supabase
      .from('seo_audits')
      .insert({
        cliente_id,
        audit_date: new Date().toISOString().split('T')[0],
        audit_week: Math.ceil(
          (new Date().getDate() + new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()) / 7
        ),
        seo_score,
        page_speed_score,
        mobile_score,
        ux_score,
        seo_health,
        total_keywords,
        ranking_1_10,
        ranking_11_50,
        ranking_51_100,
        top_keywords,
        organic_traffic,
        organic_traffic_change,
        critical_issues,
        warnings,
        opportunities,
        opportunities_list,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('SEO Audit error:', error)
    return NextResponse.json(
      { error: 'Failed to save SEO audit' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cliente_id = searchParams.get('cliente_id')
    const limit = parseInt(searchParams.get('limit') || '4')

    const { data, error } = await supabase
      .from('seo_audits')
      .select('*')
      .eq('cliente_id', cliente_id)
      .order('audit_date', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('SEO Audit GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SEO audits' },
      { status: 500 }
    )
  }
}
