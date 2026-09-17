import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { type SiteConfig, readSiteUrl } from './site-config.server';


export const getSiteConfig = createServerFn({ method: 'GET' }).handler(
    (): SiteConfig => ({ siteUrl: readSiteUrl() ?? new URL(getRequest().url).origin })
);
