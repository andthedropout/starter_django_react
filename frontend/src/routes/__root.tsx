import type { ReactNode } from 'react'
import { createRootRoute, Outlet, Scripts, HeadContent } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'
import { Header } from '@/components/layout/Header'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Django React Start',
      },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  const { isLoading, fontsReady } = useTheme()
  const isServer = typeof window === 'undefined'

  // During SSR, skip the loading screen and render content directly
  // The client will hydrate and handle the loading state
  const showLoading = !isServer && (isLoading || !fontsReady)

  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {showLoading ? (
          <div
            className="min-h-screen flex items-center justify-center bg-background"
            style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s' }}
          >
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full bg-primary"
                style={{
                  animation: 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              />
              <div
                className="absolute inset-2 rounded-full bg-primary"
                style={{
                  opacity: 0.7,
                  animation: 'pulse-medium 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.2s'
                }}
              />
              <div
                className="absolute inset-4 rounded-full bg-primary"
                style={{
                  opacity: 0.4,
                  animation: 'pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite 0.4s'
                }}
              />
            </div>
            <style>{`
              @keyframes pulse-slow {
                0%, 100% { transform: scale(1); opacity: 0.3; }
                50% { transform: scale(1.1); opacity: 0.8; }
              }
              @keyframes pulse-medium {
                0%, 100% { transform: scale(1); opacity: 0.5; }
                50% { transform: scale(1.2); opacity: 0.9; }
              }
              @keyframes pulse-fast {
                0%, 100% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.3); opacity: 1; }
              }
            `}</style>
          </div>
        ) : (
          <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </div>
        )}
        <Scripts />
      </body>
    </html>
  )
}
