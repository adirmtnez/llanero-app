import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
      {children}
    </div>
  )
}

export const metadata = {
  title: 'Llanero App',
  description: 'Aplicación cliente de Llanero App',
}