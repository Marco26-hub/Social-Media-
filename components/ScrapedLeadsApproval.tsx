'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AlertCircle, Mail, Phone, Building2, Zap } from 'lucide-react'

interface ScrapedLead {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  role: string
  source: string
  engagement_score: number
  temperature: 'CALDO' | 'TIEPIDO' | 'FREDDO'
  temperature_reason: string
  status: 'PENDING' | 'FLAGGED' | 'APPROVED' | 'CONTACTED' | 'PURCHASED' | 'REJECTED'
  flagged_reason?: string
  flagged_by?: string
  follower_count?: number
  engagement_rate?: number
}

export default function ScrapedLeadsApproval({
  clienteId,
}: {
  clienteId: string
}) {
  const [leads, setLeads] = useState<ScrapedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'CALDO' | 'TIEPIDO' | 'FREDDO' | 'ALL'>('CALDO')
  const [flagging, setFlagging] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    loadLeads()
  }, [clienteId, filter])

  const loadLeads = async () => {
    try {
      setLoading(true)
      // In a real app, this would fetch from /api/leads endpoint
      // For now, showing structure
      const response = await fetch(
        `/api/leads?cliente_id=${clienteId}&status=PENDING`
      )
      const data = await response.json()
      setLeads(data || [])
    } catch (error) {
      console.error('Failed to load leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlagLead = async (
    leadId: string,
    reason: string,
    userId: string
  ) => {
    try {
      setFlagging(leadId)

      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'FLAGGED',
          flagged_reason: reason,
          flagged_by: userId,
        }),
      })

      if (!response.ok) throw new Error('Failed to flag')

      await loadLeads()
    } catch (error) {
      console.error('Failed to flag lead:', error)
      alert('Errore nel flagging')
    } finally {
      setFlagging(null)
    }
  }

  const handleApproveLead = async (
    leadId: string,
    userId: string
  ) => {
    try {
      setApproving(leadId)

      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
        }),
      })

      if (!response.ok) throw new Error('Failed to approve')

      await loadLeads()
    } catch (error) {
      console.error('Failed to approve lead:', error)
      alert('Errore nell\'approvazione')
    } finally {
      setApproving(null)
    }
  }

  const getTemperatureColor = (temp: string) => {
    switch (temp) {
      case 'CALDO':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'TIEPIDO':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'FREDDO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTemperatureLabel = (temp: string) => {
    switch (temp) {
      case 'CALDO':
        return '🔥 HOT'
      case 'TIEPIDO':
        return '🌡️ WARM'
      case 'FREDDO':
        return '❄️ COLD'
      default:
        return temp
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento lead...</div>
  }

  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-600" />
          Lead Scraped Weekly
        </CardTitle>
        <CardDescription>
          Clienti trovati da scraping - Revisionu & Flagga
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Buttons */}
        <div className="flex gap-2 pb-4 border-b">
          {(['CALDO', 'TIEPIDO', 'FREDDO', 'ALL'] as const).map((temp) => (
            <Button
              key={temp}
              variant={filter === temp ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(temp)}
              className={
                filter === temp
                  ? temp === 'CALDO'
                    ? 'bg-red-600'
                    : temp === 'TIEPIDO'
                      ? 'bg-amber-600'
                      : temp === 'FREDDO'
                        ? 'bg-blue-600'
                        : ''
                  : ''
              }
            >
              {temp === 'CALDO'
                ? '🔥 Hot'
                : temp === 'TIEPIDO'
                  ? '🌡️ Warm'
                  : temp === 'FREDDO'
                    ? '❄️ Cold'
                    : 'All'}
            </Button>
          ))}
        </div>

        {/* Leads Grid */}
        {leads.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="p-4 bg-white rounded-lg border border-purple-200 space-y-3"
              >
                {/* Header with temperature */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{lead.name}</p>
                      <Badge className={getTemperatureColor(lead.temperature)}>
                        {getTemperatureLabel(lead.temperature)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{lead.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{lead.source}</p>
                    <p className="text-sm font-bold text-purple-600">
                      Score: {lead.engagement_score}/100
                    </p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a href={`tel:${lead.phone}`} className="text-blue-600">
                        {lead.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 col-span-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span>{lead.role}</span>
                  </div>
                </div>

                {/* Engagement metrics */}
                {(lead.follower_count || lead.engagement_rate) && (
                  <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded text-sm">
                    {lead.follower_count && (
                      <div>
                        <p className="text-gray-600">Followers</p>
                        <p className="font-bold">{lead.follower_count.toLocaleString()}</p>
                      </div>
                    )}
                    {lead.engagement_rate && (
                      <div>
                        <p className="text-gray-600">Engagement</p>
                        <p className="font-bold">{lead.engagement_rate.toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Why hot/warm/cold */}
                {lead.temperature_reason && (
                  <div className="p-2 bg-amber-50 rounded text-sm border border-amber-200">
                    <p className="text-gray-700">
                      <span className="font-medium">Why:</span> {lead.temperature_reason}
                    </p>
                  </div>
                )}

                {/* Status badge */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Badge
                    variant={
                      lead.status === 'APPROVED'
                        ? 'default'
                        : lead.status === 'FLAGGED'
                          ? 'destructive'
                          : 'secondary'
                    }
                  >
                    {lead.status}
                  </Badge>

                  {lead.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleFlagLead(
                            lead.id,
                            'Not interested or duplicate',
                            'current-user'
                          )
                        }
                        disabled={flagging === lead.id}
                      >
                        {flagging === lead.id ? '⏳' : '🚩'} Flag
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveLead(lead.id, 'current-user')}
                        disabled={approving === lead.id}
                      >
                        {approving === lead.id ? '⏳' : '✅'} Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {filter === 'ALL'
              ? 'No leads found'
              : `No ${filter} leads found`}
          </div>
        )}

        {/* Stats */}
        {leads.length > 0 && (
          <div className="p-3 bg-white rounded-lg border grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <p className="text-gray-600">Total Leads</p>
              <p className="text-lg font-bold text-purple-600">{leads.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Caldo</p>
              <p className="text-lg font-bold text-red-600">
                {leads.filter((l) => l.temperature === 'CALDO').length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Conversion Rate</p>
              <p className="text-lg font-bold text-green-600">
                {(
                  (leads.filter((l) => l.status === 'PURCHASED').length /
                    leads.length) *
                  100
                ).toFixed(0)}
                %
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
