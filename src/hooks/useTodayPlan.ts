'use client'
import { useEffect, useState } from 'react'

export interface TodayPlan {
  phase: string
  overview: string
  macros: {
    protein_g: number
    sugar_g: number
    starches_g: number
    fat_g: number
  }
  meals: { time: string; title: string; notes?: string }[]
  workouts: { focus: string; intensity: string; examples: string[] }[]
  supplements: string[]
}

export function useTodayPlan() {
  const [data, setData] = useState<TodayPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/today')
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { data, loading, error }
}
