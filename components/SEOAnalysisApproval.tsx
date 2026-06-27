'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingUp, MapPin, CheckCircle, Clock } from 'lucide-react'

interface SEOAudit {
  id: string
  seo_score: number
  page_speed_score: number
  mobile_score: number
  ux_score: number
  seo_health: string
  top_keywords: any[]
  organic_traffic: number
  organic_traffic_change: number
  critical_issues: number
  opportunities: number
  opportunities_list: any[]
}

interface GEOAnalysis {
  id: string
  target_city: string
  target_region: string
  local_seo_score: number
  gmb_status: string
  competitive_position: string
  quick_wins: any[]
  long_term: any[]
}

interface Recommendation {
  id: string
  title: string
  description: string
  recommendation_type: string
  priority: string
  estimated_time: number
  estimated_traffic_impact: number
  difficulty: string
  status: string
}

export default function SEOAnalysisApproval({
  clienteId,
}: {
  clienteId: string
}) {
  const [seoAudit, setSeoAudit] = useState<SEOAudit | null>(null)
  const [geoAnalysis, setGeoAnalysis] = useState<GEOAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    loadAnalysis()
  }, [clienteId])

  const loadAnalysis = async () => {
    try {
      setLoading(true)

      // Get latest SEO audit
      const seoRes = await fetch(
        `/api/ai-automation/seo-audit?cliente_id=${clienteId}&limit=1`
      )
      const seoData = await seoRes.json()
      setSeoAudit(seoData[0] || null)

      // Get GEO analysis
      const geoRes = await fetch(
        `/api/ai-automation/geo-analysis?cliente_id=${clienteId}`
      )
      const geoData = await geoRes.json()
      setGeoAnalysis(geoData)

      // Get pending recommendations
      const recsRes = await fetch(
        `/api/ai-automation/seo-recommendations?cliente_id=${clienteId}&status=PENDING`
      )
      const recsData = await recsRes.json()
      setRecommendations(recsData)
    } catch (error) {
      console.error('Failed to load analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRecommendation = async (
    recommendationId: string,
    userId: string
  ) => {
    try {
      setApproving(recommendationId)

      const res = await fetch(`/api/ai-automation/seo-recommendations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recommendation_id: recommendationId,
          status: 'APPROVED',
          approved_by: userId,
        }),
      })

      if (!res.ok) throw new Error('Failed to approve')

      // Auto-refresh after approval
      await loadAnalysis()
    } catch (error) {
      console.error('Failed to approve:', error)
      alert('Errore nell\'approvazione')
    } finally {
      setApproving(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento analisi SEO...</div>
  }

  return (
    <div className="grid gap-6">
      {/* SEO Overview */}
      {seoAudit && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              SEO Audit Settimanale
            </CardTitle>
            <CardDescription>
              Analisi della salute SEO del tuo sito
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ScoreBox
                label="SEO Score"
                value={seoAudit.seo_score}
                max={100}
                color="blue"
              />
              <ScoreBox
                label="Page Speed"
                value={seoAudit.page_speed_score}
                max={100}
                color="green"
              />
              <ScoreBox
                label="Mobile"
                value={seoAudit.mobile_score}
                max={100}
                color="purple"
              />
              <ScoreBox
                label="UX"
                value={seoAudit.ux_score}
                max={100}
                color="orange"
              />
            </div>

            {/* Health Status */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <span className="font-medium">Stato Generale</span>
              <Badge
                variant={
                  seoAudit.seo_health === 'EXCELLENT'
                    ? 'default'
                    : seoAudit.seo_health === 'GOOD'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {seoAudit.seo_health}
              </Badge>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-white rounded-lg border">
              <div>
                <p className="text-sm text-gray-600">Organic Traffic</p>
                <p className="text-lg font-bold">{seoAudit.organic_traffic}</p>
                <p
                  className={`text-xs ${
                    seoAudit.organic_traffic_change >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {seoAudit.organic_traffic_change > 0 ? '+' : ''}
                  {seoAudit.organic_traffic_change}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Keywords</p>
                <p className="text-lg font-bold">
                  {seoAudit.top_keywords?.length || 0}
                </p>
              </div>
            </div>

            {/* Issues & Opportunities */}
            {(seoAudit.critical_issues > 0 || seoAudit.opportunities > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {seoAudit.critical_issues > 0 && (
                  <div className="p-3 bg-red-100 rounded-lg border border-red-200">
                    <p className="text-sm font-medium text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Critical Issues
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {seoAudit.critical_issues}
                    </p>
                  </div>
                )}
                {seoAudit.opportunities > 0 && (
                  <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
                    <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Opportunities
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {seoAudit.opportunities}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* GEO Analysis */}
      {geoAnalysis && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Analisi GEO - {geoAnalysis.target_city}
            </CardTitle>
            <CardDescription>
              Local SEO e competitività geografica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ScoreBox
                label="Local SEO"
                value={geoAnalysis.local_seo_score}
                max={100}
                color="green"
              />
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-600">GMB Status</p>
                <p className="font-bold capitalize">{geoAnalysis.gmb_status}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-600">Posizione</p>
                <Badge>{geoAnalysis.competitive_position}</Badge>
              </div>
            </div>

            {/* Quick Wins */}
            {geoAnalysis.quick_wins && geoAnalysis.quick_wins.length > 0 && (
              <div className="p-3 bg-white rounded-lg border">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quick Wins
                </p>
                <ul className="space-y-2">
                  {geoAnalysis.quick_wins.map((win: any, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700">
                      ✓ {win.action} ({win.time})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-amber-600" />
              Raccomandazioni ({recommendations.length})
            </CardTitle>
            <CardDescription>
              Accettate per implementare i miglioramenti
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 bg-white rounded-lg border border-amber-200 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{rec.title}</p>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                  <Badge
                    variant={
                      rec.priority === 'HIGH'
                        ? 'destructive'
                        : rec.priority === 'MEDIUM'
                          ? 'secondary'
                          : 'default'
                    }
                  >
                    {rec.priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Tempo</p>
                    <p className="font-medium">{rec.estimated_time} min</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Traffic Impact</p>
                    <p className="font-medium">+{rec.estimated_traffic_impact}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Difficoltà</p>
                    <p className="font-medium">{rec.difficulty}</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleApproveRecommendation(rec.id, 'user-id')}
                  disabled={approving === rec.id}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {approving === rec.id ? 'Approvando...' : 'Approva & Implementa'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!seoAudit && !recommendations.length && (
        <Card>
          <CardContent className="text-center py-8 text-gray-500">
            Nessuna analisi SEO disponibile. Torna domani per il report.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ScoreBox({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const percentage = (value / max) * 100
  const colorClass = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  }[color]

  return (
    <div className="p-3 bg-white rounded-lg border">
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div
          className={`h-2 rounded-full ${
            color === 'blue'
              ? 'bg-blue-600'
              : color === 'green'
                ? 'bg-green-600'
                : color === 'purple'
                  ? 'bg-purple-600'
                  : 'bg-orange-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
  )
}
