import type { Core } from '@strapi/strapi';

/**
 * Content types that have a page on the frontend and can be previewed.
 * Extend this list (and the handler below) when adding new previewable types.
 */
const PREVIEWABLE_CONTENT_TYPES = ['api::page.page'];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => {
  const clientUrl = env('CLIENT_URL', 'http://localhost:3000');
  const previewSecret = env('PREVIEW_SECRET', '');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET')!,
    },
    apiToken: {
      salt: env('API_TOKEN_SALT')!,
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT')!,
      },
    },
    secrets: {
      encryptionKey: env('ENCRYPTION_KEY')!,
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
      docLinks: env.bool('FLAG_DOC_LINKS', true),
    },
    preview: {
      enabled: env.bool('PREVIEW_ENABLED', true),
      config: {
        allowedOrigins: [clientUrl],
        async handler(uid, { documentId, locale, status }) {
          if (!PREVIEWABLE_CONTENT_TYPES.includes(uid)) {
            return null;
          }

          const document = await strapi.documents(uid as 'api::page.page').findOne({
            documentId,
            locale: locale ?? undefined,
            status: status === 'published' ? 'published' : 'draft',
            fields: ['slug'],
          });

          if (!document?.slug) {
            return null;
          }

          const params = new URLSearchParams({
            secret: previewSecret,
            slug: document.slug,
            status: status ?? 'draft',
          });
          if (locale) {
            params.set('locale', locale);
          }

          return `${clientUrl}/api/preview?${params.toString()}`;
        },
      },
    },
  };
};

export default config;
