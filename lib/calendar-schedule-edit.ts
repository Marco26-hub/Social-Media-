import { scheduleTarget } from './calendar-slot'
export { scheduleMatches as matchesSchedule } from './blotato-schedules'

export function editableSchedule(row: Record<string, unknown>): boolean {
  if (row.publish_lock_id || row.blotato_post_url || row.status === 'ARCHIVIATO' || ['published', 'in-progress', 'failed'].includes(String(row.blotato_status))) return false
  return row.status !== 'PUBBLICATO' || row.blotato_status === 'scheduled'
}
export function validatedScheduleTime(day: string, time: string, timezone: string): string {
  return scheduleTarget(day, time, timezone, -Infinity).iso
}
