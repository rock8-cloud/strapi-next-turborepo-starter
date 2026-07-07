import type { Core } from '@strapi/strapi';

const hostOf = (url?: string) => {
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
};

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  // Allow admin-panel thumbnails/previews to load media from S3 storage.
  const mediaHosts = [hostOf(env('S3_PUBLIC_URL')), hostOf(env('S3_ENDPOINT'))].filter(
    (host): host is string => Boolean(host)
  );
  // Allow the Preview panel to embed the Next.js frontend in an iframe.
  const clientUrl = env('CLIENT_URL', 'http://localhost:3000');

  return [
    'strapi::logger',
    'strapi::errors',
    {
      name: 'strapi::security',
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', 'market-assets.strapi.io', ...mediaHosts],
            'media-src': ["'self'", 'data:', 'blob:', ...mediaHosts],
            'frame-src': ["'self'", clientUrl],
            upgradeInsecureRequests: null,
          },
        },
      },
    },
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
};

export default config;
