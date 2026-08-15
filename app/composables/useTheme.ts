  // app/composables/useTheme.ts
export const useTheme = () => {
  const theme = useCookie<'light' | 'dark'>('theme', {
    default: () => 'light',
    maxAge: 60 * 60 * 24 * 365
  })

  const toggle = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
  }

  return { theme, toggle }
}