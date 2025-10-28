import React from 'react';
import AnimatedBackground from '@/components/backgrounds/AnimatedBackground';
import { SEO } from '@/components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Welcome | My App"
        description="Your clean Django + React starter template - build modern web applications with ease"
        keywords="django, react, vite, starter template, web development"
        ogImage="/images/og-image.png"
      />
      <AnimatedBackground type="clouds" opacity={1.0} className="flex items-center justify-center py-20 min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-muted-foreground">
            Your clean Django + React starter template
          </p>
        </div>
      </AnimatedBackground>
    </>
  );
}
