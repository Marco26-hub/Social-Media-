// app/api/ai-automation/geo-analysis/route.ts
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
      target_city,
      target_region,
      target_country = 'IT',
      local_seo_score,
      gmb_status,
      gmb_reviews_count,
      gmb_rating,
      local_keywords,
      local_top_3,
      local_competitors,
      competitive_position,
      quick_wins,
      long_term,
    } = await req.json()

    const { data, error } = await supabase
      .from('geo_analysis')
      .insert({
        cliente_id,
        audit_date: new Date().toISOString().split('T')[0],
        target_city,
        target_region,
        target_country,
        local_seo_score,
        gmb_status,
        gmb_reviews_count,
        gmb_rating,
        local_keywords,
        local_top_3,
        local_competitors,
        competitive_position,
        quick_wins,
        long_term,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('GEO Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to save GEO analysis' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cliente_id = searchParams.get('cliente_id')

    const { data, error } = await supabase
      .from('geo_analysis')
      .select('*')
      .eq('cliente_id', cliente_id)
      .order('audit_date', { ascending: false })
      .limit(1)

    if (error) throw error

    return NextResponse.json(data[0] || null)
  } catch (error) {
    console.error('GEO Analysis GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GEO analysis' },
      { status: 500 }
    )
  }
}
