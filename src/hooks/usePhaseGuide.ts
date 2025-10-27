'use client'
import { useEffect, useState } from 'react'
import type { TodayPlan } from './useTodayPlan'

export function usePhaseGuide(phase: string) {
  const [data, setData] = useState<TodayPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!phase) return
      try {
        const res = await fetch(`/api/phase/${phase}`)
        if (!res.ok) throw new Error('Failed to fetch phase guide')
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [phase])

  return { data, loading, error }
}
