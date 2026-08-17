import { ref, computed } from 'vue'

export type DateRangeOption = 'yesterday' | 'today' | 'past_week' | 'last_30_days'

// selected option (default 'today')
export const selected = ref<DateRangeOption>('today')

const MS_PER_DAY = 24 * 60 * 60 * 1000

// computed exclusive range { start: Date, end: Date }
export const range = computed(() => {
  const now = new Date()
  // local midnight for today
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  let start: Date
  // end is exclusive — start of the day after the range ends
  const end = new Date(startOfToday.getTime() + MS_PER_DAY) // midnight tomorrow

  switch (selected.value) {
    case 'yesterday':
      start = new Date(startOfToday.getTime() - MS_PER_DAY)
      break
    case 'past_week':
      // 7 days back from midnight today (inclusive) → midnight tomorrow (exclusive)
      start = new Date(startOfToday.getTime() - 7 * MS_PER_DAY)
      break
    case 'last_30_days':
      start = new Date(startOfToday.getTime() - 30 * MS_PER_DAY)
      break
    case 'today':
    default:
      start = startOfToday
      break
  }

  return { start, end }
})

export default function useDateRangeFilter() {
  return { selected, range }
}
