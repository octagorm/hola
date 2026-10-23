import { ArrowRight } from 'lucide-react'
import { useStore } from './lib/store'
import { todays } from './lib/today'
import { STORY } from './data/stories'

// A game or a chapter opened from today's chapter knows it: its way back
// leads there, and its end has a way on.

// Whether this page is a step of today's chapter, and if it is done
export function useInToday(
  page: string,
  arg?: string,
): { step: boolean; done: boolean } {
  const { bank } = useStore()
  const p = todays(bank, Date.now())
  const s = p?.steps.find((x) =>
    STORY[page]
      ? x.k === 'story' && x.arg === arg
      : x.k === 'game' && x.arg === page,
  )
  return { step: !!s, done: !!s?.done }
}

// Where the page's back button leads: today's chapter, if it came from it
export function useBack(page: string, arg?: string): string {
  return useInToday(page, arg).step ? '#hoy' : '#'
}

// The way on to the rest of today's chapter, once this step of it is done
export function TodayNext({
  page,
  arg,
  className = 'q-btn',
}: {
  page: string
  arg?: string
  className?: string
}) {
  const { step, done } = useInToday(page, arg)
  if (!step || !done) return null
  return (
    <a className={className} href="#hoy">
      Videre i dagens kapittel <ArrowRight />
    </a>
  )
}
