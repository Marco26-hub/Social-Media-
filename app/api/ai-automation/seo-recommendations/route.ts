// app/api/ai-automation/seo-recommendations/route.ts
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
      seo_audit_id,
      recommendation_type,
      priority,
      title,
      description,
      estimated_time,
      estimated_traffic_impact,
      difficulty,
    } = await req.json()

    const { data, error } = await supabase
      .from('seo_recommendations')
      .insert({
        cliente_id,
        seo_audit_id,
        recommendation_type,
        priority,
        title,
        description,
        estimated_time,
        estimated_traffic_impact,
        difficulty,
        status: 'PENDING',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('SEO Recommendation error:', error)
    return NextResponse.json(
      { error: 'Failed to save recommendation' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const cliente_id = searchParams.get('cliente_id')
    const status = searchParams.get('status') || 'PENDING'

    const { data, error } = await supabase
      .from('seo_recommendations')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('status', status)
      .order('priority', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('SEO Recommendations GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const {
      recommendation_id,
      status,
      approved_by,
      actual_impact,
    } = await req.json()

    const updateData: any = { status }
    if (status === 'APPROVED') {
      updateData.approved_at = new Date().toISOString()
      updateData.approved_by = approved_by
    }
    if (status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString()
      updateData.actual_impact = actual_impact
    }

    const { data, error } = await supabase
      .from('seo_recommendations')
      .update(updateData)
      .eq('id', recommendation_id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('SEO Recommendation PATCH error:', error)
    return NextResponse.json(
      { error: 'Failed to update recommendation' },
      { status: 500 }
    )
  }
}
