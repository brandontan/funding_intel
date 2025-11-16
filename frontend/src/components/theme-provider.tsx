'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

export function ThemeProvider({ children }: Props) {
  return <>{children}</>
}
