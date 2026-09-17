import { createFileRoute } from '@tanstack/react-router'

import { HomePage } from '@/features/home/pages/home-page'
import { getSiteConfig } from '@/lib/site-config'

const TITLE = 'Django + React Starter'
const DESCRIPTION =
  'A lean Django REST and React 19 starter: session authentication, a typed API boundary, server-rendered public pages, and one-command Docker development.'

export const Route = createFileRoute('/')({
  // The only indexable page, so it is the only one rendered on the server.
  ssr: true,
  // The public origin comes from the SITE_URL runtime env, never from the client bundle.
  loader: () => getSiteConfig(),
  staleTime: Infinity,
  head: ({ loaderData }) => {
    const canonical = loaderData ? `${loaderData.siteUrl}/` : undefined

    return {
      meta: [
        { title: TITLE },
        { name: 'description', content: DESCRIPTION },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: TITLE },
        { property: 'og:description', content: DESCRIPTION },
        ...(canonical ? [{ property: 'og:url', content: canonical }] : []),
        { name: 'twitter:card', content: 'summary' },
      ],
      links: canonical ? [{ rel: 'canonical', href: canonical }] : [],
    }
  },
  component: HomePage,
})
