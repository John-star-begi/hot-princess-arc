import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export function createServerSupabase() {
  console.log('🟢 createServerSupabase() called')

  let cookieStore: ReturnType<typeof cookies>
  try {
    cookieStore = cookies()
  } catch {
    console.warn('⚠️ cookies() not available on this runtime.')
    // Fallback empty cookie store
    cookieStore = { get: () => undefined, set: () => {}, delete: () => {} } as any
  }

  try {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (err) {
              console.warn('Cookie set failed:', err)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (err) {
              console.warn('Cookie remove failed:', err)
            }
          },
        },
      }
    )
    console.log('✅ Supabase client created')
    return client
  } catch (error) {
    console.error('❌ createServerSupabase() failed:', error)
    throw error
  }
}
