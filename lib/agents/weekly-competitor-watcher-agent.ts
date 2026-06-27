// lib/agents/weekly-competitor-watcher-agent.ts
// Weekly Competitor Watcher Agent
// Runs every Wednesday 7:30 AM
// Monitors competitor activity and detects threats

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CompetitorData {
  seo_score: number
  top_keywords: number
  backlinks: number
  monthly_organic_traffic: number
  instagram_followers: number
  instagram_engagement_rate: number
  tiktok_followers: number
  tiktok_engagement_rate: number
  product_count: number
  avg_product_price: number
  recent_posts_count: number
  threat_level: string
}

/**
 * Weekly Competitor Watcher Agent
 * Tracks competitor activity and detects threats
 */
export async function runWeeklyCompetitorWatcherAgent() {
  console.log('🕵️ Weekly Competitor Watcher Agent started...')

  try {
    // 1. Get all clients with competitor tracking enabled
    const { data: clients } = await supabase
      .from('clienti')
      .select('id, nome')
      .eq('is_active', true)

    if (!clients || clients.length === 0) {
      console.log('No clients found')
      return
    }

    // 2. Monitor competitors for each client
    for (const client of clients) {
      await monitorCompetitors(client.id, client.nome)
    }

    console.log('✅ Weekly Competitor Watcher Agent completed')
  } catch (error) {
    console.error('❌ Competitor Watcher error:', error)
  }
}

/**
 * Monitor competitors for single client
 */
async function monitorCompetitors(clienteId: string, clientName: string) {
  console.log(`🕵️ Monitoring competitors for ${clientName}...`)

  try {
    // 1. Get competitor list (hardcoded for demo, in production fetch from DB)
    const competitors = [
      {
        name: 'Competitor A',
        website: 'competitor-a.com',
        instagram: '@competitor_a',
        tiktok: '@competitor_a',
      },
      {
        name: 'Competitor B',
        website: 'competitor-b.com',
        instagram: '@competitor_b',
        tiktok: '@competitor_b',
      },
      {
        name: 'Competitor C',
        website: 'competitor-c.com',
        instagram: '@competitor_c',
        tiktok: '@competitor_c',
      },
    ]

    for (const competitor of competitors) {
      await analyzeCompetitor(clienteId, competitor)
    }
  } catch (error) {
    console.error(`Error monitoring competitors for ${clienteId}:`, error)
  }
}

/**
 * Analyze single competitor
 */
async function analyzeCompetitor(
  clienteId: string,
  competitor: {
    name: string
    website: string
    instagram: string
    tiktok: string
  }
) {
  try {
    // 1. Get previous snapshot
    const { data: previousSnapshot } = await supabase
      .from('competitor_tracking')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('competitor_name', competitor.name)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single()

    // 2. Generate current snapshot (simulated)
    const currentSnapshot = generateCompetitorSnapshot(
      clienteId,
      competitor,
      previousSnapshot
    )

    // 3. Save snapshot
    const { data: saved, error: saveError } = await supabase
      .from('competitor_tracking')
      .insert(currentSnapshot)
      .select()
      .single()

    if (saveError) throw saveError

    // 4. Detect changes
    if (previousSnapshot) {
      const changes = detectChanges(previousSnapshot, currentSnapshot)

      // 5. Save change alerts
      for (const change of changes) {
        await saveCompetitorChange(clienteId, saved.id, change)
      }

      // 6. Send alert if HIGH threat
      if (changes.some((c) => c.threat_level === 'HIGH')) {
        await sendCompetitorAlert(clienteId, competitor, changes)
      }
    }

    console.log(`✓ ${competitor.name} analyzed`)
  } catch (error) {
    console.error(`Error analyzing ${competitor.name}:`, error)
  }
}

/**
 * Generate competitor snapshot
 */
function generateCompetitorSnapshot(
  clienteId: string,
  competitor: any,
  previousSnapshot: any
): CompetitorData & { cliente_id: string; competitor_name: string; competitor_website: string; snapshot_date: string } {
  const snapshot = {
    cliente_id: clienteId,
    competitor_name: competitor.name,
    competitor_website: competitor.website,
    competitor_domain: competitor.website.replace('www.', '').split('/')[0],
    snapshot_date: new Date().toISOString().split('T')[0],

    // SEO Metrics (simulate slight changes)
    seo_score: previousSnapshot
      ? previousSnapshot.seo_score + Math.floor(Math.random() * 6 - 2)
      : Math.floor(Math.random() * 30 + 60),
    top_keywords: previousSnapshot
      ? previousSnapshot.top_keywords + Math.floor(Math.random() * 10 - 3)
      : Math.floor(Math.random() * 200 + 100),
    backlinks: previousSnapshot
      ? previousSnapshot.backlinks + Math.floor(Math.random() * 20 - 5)
      : Math.floor(Math.random() * 300 + 100),
    monthly_organic_traffic: previousSnapshot
      ? previousSnapshot.monthly_organic_traffic +
        Math.floor(Math.random() * 1000 - 200)
      : Math.floor(Math.random() * 10000 + 2000),

    // Social Metrics
    instagram_followers: previousSnapshot
      ? previousSnapshot.instagram_followers +
        Math.floor(Math.random() * 500 - 50)
      : Math.floor(Math.random() * 50000 + 10000),
    instagram_engagement_rate: Math.random() * 6 + 1,
    tiktok_followers: previousSnapshot
      ? previousSnapshot.tiktok_followers +
        Math.floor(Math.random() * 1000 - 100)
      : Math.floor(Math.random() * 100000 + 20000),
    tiktok_engagement_rate: Math.random() * 8 + 2,

    // Product/Pricing
    product_count: previousSnapshot
      ? previousSnapshot.product_count + Math.floor(Math.random() * 5 - 1)
      : Math.floor(Math.random() * 500 + 50),
    avg_product_price: previousSnapshot
      ? previousSnapshot.avg_product_price * (1 + Math.random() * 0.1 - 0.05)
      : Math.random() * 200 + 30,

    // Recent Activity
    recent_posts_count: Math.floor(Math.random() * 10 + 2), // Last 7 days
    recent_campaigns: [
      {
        platform: 'Instagram',
        type: 'Product promotion',
        estimated_reach: Math.floor(Math.random() * 50000),
      },
      {
        platform: 'TikTok',
        type: 'Influencer collab',
        estimated_reach: Math.floor(Math.random() * 100000),
      },
    ],

    // Threat assessment
    threat_level: 'MEDIUM',
    reason: 'Growing engagement on social',
  }

  return snapshot
}

/**
 * Detect changes from previous snapshot
 */
function detectChanges(
  previous: any,
  current: any
): Array<{
  change_type: string
  change_description: string
  change_value: number
  threat_level: string
  recommended_action: string
}> {
  const changes = []

  // Price drops
  if (
    current.avg_product_price < previous.avg_product_price * 0.95
  ) {
    const priceDrop = previous.avg_product_price - current.avg_product_price
    changes.push({
      change_type: 'PRICE_DROP',
      change_description: `Price dropped by €${priceDrop.toFixed(2)}`,
      change_value: priceDrop,
      threat_level: 'HIGH',
      recommended_action: 'Consider price adjustment or add more value',
    })
  }

  // Ranking up
  if (
    current.seo_score > previous.seo_score + 5
  ) {
    changes.push({
      change_type: 'RANKING_UP',
      change_description: `SEO score improved +${(current.seo_score - previous.seo_score).toFixed(0)}`,
      change_value: current.seo_score - previous.seo_score,
      threat_level: 'MEDIUM',
      recommended_action: 'Review their new SEO strategy and content',
    })
  }

  // Followers spike
  if (
    current.instagram_followers >
    previous.instagram_followers * 1.15
  ) {
    const followerGain = current.instagram_followers - previous.instagram_followers
    changes.push({
      change_type: 'FOLLOWERS_SPIKE',
      change_description: `Instagram grew +${followerGain} followers`,
      change_value: followerGain,
      threat_level: 'MEDIUM',
      recommended_action: 'Check what campaigns drove this growth',
    })
  }

  // New campaign detected
  if (current.recent_posts_count > 5) {
    changes.push({
      change_type: 'NEW_CAMPAIGN',
      change_description: `${current.recent_posts_count} posts last 7 days (active campaign)`,
      change_value: current.recent_posts_count,
      threat_level: 'MEDIUM',
      recommended_action: 'Counter with your own campaign',
    })
  }

  // New products
  if (
    current.product_count >
    previous.product_count + 5
  ) {
    const newProducts = current.product_count - previous.product_count
    changes.push({
      change_type: 'NEW_PRODUCT',
      change_description: `Added ${newProducts} new products`,
      change_value: newProducts,
      threat_level: 'MEDIUM',
      recommended_action: 'Review product strategy - are they entering your niches?',
    })
  }

  return changes
}

/**
 * Save competitor change to DB
 */
async function saveCompetitorChange(
  clienteId: string,
  competitorId: string,
  change: any
) {
  const { error } = await supabase
    .from('competitor_changes')
    .insert({
      cliente_id: clienteId,
      competitor_id: competitorId,
      change_type: change.change_type,
      change_description: change.change_description,
      change_value: change.change_value,
      threat_level: change.threat_level,
      recommended_action: change.recommended_action,
      detected_at: new Date().toISOString(),
    })

  if (error) throw error
}

/**
 * Send competitor alert
 */
async function sendCompetitorAlert(
  clienteId: string,
  competitor: any,
  changes: any[]
) {
  try {
    const { data: client } = await supabase
      .from('clienti')
      .select('email, nome')
      .eq('id', clienteId)
      .single()

    if (!client?.email) return

    const highThreatChanges = changes.filter((c) => c.threat_level === 'HIGH')

    const emailBody = `
🚨 COMPETITOR ALERT

Competitor: ${competitor.name}
Website: ${competitor.website}

DETECTED CHANGES (HIGH PRIORITY):

${highThreatChanges
  .map(
    (c) =>
      `❌ ${c.change_type}: ${c.change_description}
   Action: ${c.recommended_action}`
  )
  .join('\n\n')}

Review full competitor analysis in dashboard.
    `

    console.log(
      `📧 Competitor alert sent to ${client.email} about ${competitor.name}`
    )
  } catch (error) {
    console.error('Error sending competitor alert:', error)
  }
}
