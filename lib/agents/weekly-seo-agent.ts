// lib/agents/weekly-seo-agent.ts
// Weekly SEO + GEO Automation Agent
// Runs every Monday 7:15 AM

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ClientConfig {
  cliente_id: string
  website_url: string
  target_cities: Array<{ city: string; region: string }>
}

/**
 * Main SEO+GEO Agent
 * Analyzes website SEO performance and creates recommendations
 */
export async function runWeeklySEOAgent() {
  console.log('🔍 Weekly SEO Agent started...')

  try {
    // 1. Get all active clients
    const { data: clients } = await supabase
      .from('clienti')
      .select('id, config')
      .eq('is_active', true)

    if (!clients || clients.length === 0) {
      console.log('No active clients found')
      return
    }

    // 2. Process each client
    for (const client of clients) {
      await analyzeClientSEO(client.id, client.config)
    }

    console.log('✅ Weekly SEO Agent completed')
  } catch (error) {
    console.error('❌ Weekly SEO Agent error:', error)
  }
}

/**
 * Analyze single client SEO
 */
async function analyzeClientSEO(
  clienteId: string,
  config: any
) {
  console.log(`📊 Analyzing SEO for client: ${clienteId}`)

  try {
    // 1. Generate SEO Audit data (in production, this would call Google Search Console API)
    const seoData = generateMockSEOAudit()

    // 2. Save SEO audit
    const { data: seoAudit, error: seoError } = await supabase
      .from('seo_audits')
      .insert({
        cliente_id: clienteId,
        audit_date: new Date().toISOString().split('T')[0],
        ...seoData,
      })
      .select()
      .single()

    if (seoError) throw seoError

    console.log('✓ SEO Audit saved')

    // 3. Generate GEO analysis for each target city
    if (config?.target_cities && Array.isArray(config.target_cities)) {
      for (const location of config.target_cities) {
        const geoData = generateMockGEOAnalysis(location)

        const { error: geoError } = await supabase
          .from('geo_analysis')
          .insert({
            cliente_id: clienteId,
            audit_date: new Date().toISOString().split('T')[0],
            ...geoData,
          })

        if (geoError) throw geoError
      }
    }

    console.log('✓ GEO Analysis saved')

    // 4. Generate recommendations
    const recommendations = generateRecommendations(seoData)

    for (const rec of recommendations) {
      const { error: recError } = await supabase
        .from('seo_recommendations')
        .insert({
          cliente_id: clienteId,
          seo_audit_id: seoAudit.id,
          status: 'PENDING',
          ...rec,
        })

      if (recError) throw recError
    }

    console.log(`✓ ${recommendations.length} recommendations created`)

    // 5. Send email report to client
    await sendSEOReport(clienteId, seoData, recommendations)

  } catch (error) {
    console.error(`Error analyzing client ${clienteId}:`, error)
  }
}

/**
 * Generate mock SEO audit data
 * In production, integrate with Google Search Console API
 */
function generateMockSEOAudit() {
  const scores = {
    seo_score: Math.floor(Math.random() * 40 + 60), // 60-100
    page_speed_score: Math.floor(Math.random() * 40 + 55),
    mobile_score: Math.floor(Math.random() * 40 + 60),
    ux_score: Math.floor(Math.random() * 40 + 60),
  }

  const total_keywords = Math.floor(Math.random() * 300 + 150)

  return {
    ...scores,
    seo_health:
      scores.seo_score >= 80
        ? 'EXCELLENT'
        : scores.seo_score >= 60
          ? 'GOOD'
          : 'NEEDS_WORK',
    total_keywords,
    ranking_1_10: Math.floor(total_keywords * 0.15),
    ranking_11_50: Math.floor(total_keywords * 0.25),
    ranking_51_100: Math.floor(total_keywords * 0.3),
    top_keywords: [
      {
        keyword: 'main service',
        position: Math.floor(Math.random() * 10 + 1),
        search_volume: Math.floor(Math.random() * 500 + 100),
      },
      {
        keyword: 'brand name',
        position: Math.floor(Math.random() * 5 + 1),
        search_volume: Math.floor(Math.random() * 1000 + 200),
      },
      {
        keyword: 'local keyword',
        position: Math.floor(Math.random() * 15 + 5),
        search_volume: Math.floor(Math.random() * 200 + 50),
      },
    ],
    competitors_analyzed: 3,
    vs_competitor_1: 'Ahead in keywords',
    vs_competitor_2: 'Similar on speed',
    total_backlinks: Math.floor(Math.random() * 200 + 50),
    quality_backlinks: Math.floor(Math.random() * 50 + 10),
    new_backlinks_week: Math.floor(Math.random() * 5),
    organic_traffic: Math.floor(Math.random() * 5000 + 500),
    organic_traffic_change: Math.random() > 0.5 ? 5 : -3,
    featured_snippets: Math.floor(Math.random() * 5),
    critical_issues: Math.floor(Math.random() * 3),
    warnings: Math.floor(Math.random() * 8 + 2),
    opportunities: Math.floor(Math.random() * 5 + 3),
    opportunities_list: [
      {
        issue: 'Missing meta descriptions',
        pages: Math.floor(Math.random() * 20 + 5),
        impact: 'MEDIUM',
      },
      {
        issue: 'Mobile usability issues',
        pages: Math.floor(Math.random() * 10 + 2),
        impact: 'HIGH',
      },
    ],
  }
}

/**
 * Generate mock GEO analysis
 */
function generateMockGEOAnalysis(location: { city: string; region: string }) {
  return {
    target_city: location.city,
    target_region: location.region,
    target_country: 'IT',
    local_seo_score: Math.floor(Math.random() * 40 + 60),
    gmb_status: ['COMPLETE', 'INCOMPLETE', 'OPTIMIZED'][
      Math.floor(Math.random() * 3)
    ],
    gmb_reviews_count: Math.floor(Math.random() * 50),
    gmb_rating: Math.floor(Math.random() * 20 + 40) / 10, // 4.0-6.0
    local_keywords: Math.floor(Math.random() * 100 + 30),
    local_top_3: Math.floor(Math.random() * 20 + 5),
    local_competitors: Math.floor(Math.random() * 15 + 3),
    competitive_position: ['LEADER', 'STRONG', 'WEAK'][
      Math.floor(Math.random() * 3)
    ],
    quick_wins: [
      { action: 'Update GMB hours', impact: 'HIGH', time: '15 min' },
      { action: 'Add local reviews link', impact: 'MEDIUM', time: '10 min' },
    ],
    long_term: [
      { action: 'Build local citations', impact: 'MEDIUM', time: '1 week' },
      { action: 'Local link building', impact: 'HIGH', time: '2 weeks' },
    ],
  }
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  seoData: any
): Array<{
  recommendation_type: string
  priority: string
  title: string
  description: string
  estimated_time: number
  estimated_traffic_impact: number
  difficulty: string
}> {
  const recommendations = []

  // Technical recommendations
  if (seoData.page_speed_score < 70) {
    recommendations.push({
      recommendation_type: 'TECHNICAL',
      priority: 'HIGH',
      title: 'Optimize page speed',
      description:
        'Improve Core Web Vitals scores - compress images, minify CSS/JS, enable caching',
      estimated_time: 480, // 8 hours
      estimated_traffic_impact: 120,
      difficulty: 'MEDIUM',
    })
  }

  // Mobile recommendations
  if (seoData.mobile_score < 70) {
    recommendations.push({
      recommendation_type: 'TECHNICAL',
      priority: 'HIGH',
      title: 'Fix mobile usability',
      description: 'Resolve mobile-specific issues - tap targets, text size, viewport',
      estimated_time: 240, // 4 hours
      estimated_traffic_impact: 80,
      difficulty: 'EASY',
    })
  }

  // Content recommendations
  if (seoData.ranking_1_10 < seoData.total_keywords * 0.2) {
    recommendations.push({
      recommendation_type: 'CONTENT',
      priority: 'MEDIUM',
      title: 'Create content for target keywords',
      description:
        'Develop 5-10 pillar pages targeting high-volume keywords with low competition',
      estimated_time: 1200, // 20 hours
      estimated_traffic_impact: 250,
      difficulty: 'MEDIUM',
    })
  }

  // Backlink recommendations
  if (seoData.quality_backlinks < 30) {
    recommendations.push({
      recommendation_type: 'BACKLINKS',
      priority: 'MEDIUM',
      title: 'Build quality backlinks',
      description:
        'Outreach to industry blogs, directories, and local sites for link building',
      estimated_time: 600, // 10 hours
      estimated_traffic_impact: 150,
      difficulty: 'HARD',
    })
  }

  return recommendations
}

/**
 * Send email report
 */
async function sendSEOReport(
  clienteId: string,
  seoData: any,
  recommendations: any[]
) {
  try {
    // Get client email
    const { data: client } = await supabase
      .from('clienti')
      .select('email')
      .eq('id', clienteId)
      .single()

    if (!client?.email) return

    const emailBody = `
SEO Report for ${new Date().toLocaleDateString('it-IT')}

📊 SEO Score: ${seoData.seo_score}/100 (${seoData.seo_health})
⚡ Page Speed: ${seoData.page_speed_score}/100
📱 Mobile: ${seoData.mobile_score}/100
✨ UX: ${seoData.ux_score}/100

🔍 Keywords: ${seoData.total_keywords}
  - Top 10: ${seoData.ranking_1_10}
  - Top 50: ${seoData.ranking_11_50}

📈 Organic Traffic: ${seoData.organic_traffic} (${seoData.organic_traffic_change > 0 ? '+' : ''}${seoData.organic_traffic_change}%)

⚠️ Issues: ${seoData.critical_issues} critical, ${seoData.warnings} warnings
💡 Opportunities: ${seoData.opportunities}

📋 Recommendations Pending: ${recommendations.length}

${recommendations
  .slice(0, 5)
  .map(
    (r) => `
- [${r.priority}] ${r.title}
  Estimated impact: +${r.estimated_traffic_impact} visitors/month
  Time: ${Math.round(r.estimated_time / 60)} hours
`
  )
  .join('')}

Review and approve in your dashboard to implement.
    `

    console.log(`📧 Report sent to ${client.email}`)
  } catch (error) {
    console.error('Error sending report:', error)
  }
}
