import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';

/**
 * Allow unauthenticated (public) access to read pages, so the Next.js
 * frontend works out of the box without creating an API token first.
 */
async function grantPublicReadOnPages(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    return;
  }

  const actions = [
    'api::page.page.find',
    'api::page.page.findOne',
    'api::navbar.navbar.find',
    'api::footer.footer.find',
  ];

  for (const action of actions) {
    const existing = await strapi.db
      .query('plugin::users-permissions.permission')
      .findOne({ where: { action, role: publicRole.id } });

    if (!existing) {
      await strapi.db
        .query('plugin::users-permissions.permission')
        .create({ data: { action, role: publicRole.id } });
      strapi.log.info(`Granted public permission: ${action}`);
    }
  }
}

/**
 * Upload a bundled SVG from seed-assets/ into the media library (through the
 * configured upload provider — local filesystem in dev, S3 in deployment).
 * Returns the existing file if it was uploaded before.
 */
async function uploadSeedAsset(
  strapi: Core.Strapi,
  filename: string,
  alternativeText: string
) {
  const name = path.parse(filename).name;

  const existing = await strapi.db
    .query('plugin::upload.file')
    .findOne({ where: { name } });
  if (existing) {
    return existing;
  }

  const filepath = path.join(strapi.dirs.app.root, 'seed-assets', filename);
  const [file] = await strapi
    .plugin('upload')
    .service('upload')
    .upload({
      data: { fileInfo: { name, alternativeText, caption: alternativeText } },
      files: {
        filepath,
        originalFilename: filename,
        mimetype: 'image/svg+xml',
        size: fs.statSync(filepath).size,
      },
    });

  strapi.log.info(`Seeded media asset: ${filename}`);
  return file;
}

/**
 * Seed a published "Home" page on first start so the frontend and the
 * live-preview flow can be tried immediately.
 */
async function seedHomePage(strapi: Core.Strapi) {
  const count = await strapi.documents('api::page.page').count({});
  if (count > 0) {
    return null;
  }

  const heroImage = await uploadSeedAsset(
    strapi,
    'hero-composition.svg',
    'Editorial collage of content blocks composed in the CMS'
  );
  const flowImage = await uploadSeedAsset(
    strapi,
    'draft-to-publish.svg',
    'The editorial flow — draft, preview, publish'
  );

  const homePage = await strapi.documents('api::page.page').create({
    data: {
      title: 'Home',
      slug: 'home',
      seo: {
        metaTitle: 'Strapi + Next.js Starter — Rock8Cloud',
        metaDescription:
          'A production-ready Strapi 5 + Next.js monorepo: dynamic pages and navigation, live preview, ISR and one-click deploy on Rock8Cloud.',
        metaImage: heroImage.id,
        metaRobots: 'all',
      },
      blocks: [
        {
          __component: 'blocks.hero',
          heading: 'Ship a headless site in minutes.',
          subheading:
            'A production-ready Strapi 5 + Next.js starter: type-safe content, live preview, ISR, and one-click deploy on Rock8Cloud. The page you are looking at is 100% CMS content.',
          image: heroImage.id,
          ctaLabel: 'Deploy on Rock8Cloud',
          ctaHref:
            'https://app.rock8.cloud/login?redirect=/new-deployment?blueprint=strapi-nextjs',
        },
        {
          __component: 'blocks.features',
          eyebrow: 'Why this starter',
          heading: 'Everything a content site needs, wired up for you.',
          subheading:
            'Pages and navigation are dynamic. Drafts preview before publish. Deploys are a push to main. No boilerplate, no yak-shaving.',
          items: [
            {
              icon: '✦',
              title: 'Dynamic pages & navigation',
              description:
                'Build pages from blocks in Strapi. The Navbar and Footer are CMS single types — no redeploy to change a link.',
            },
            {
              icon: '👁',
              title: 'Live preview',
              description:
                'Press Preview in the admin to see unpublished drafts rendered by the real Next.js frontend, via Draft Mode.',
            },
            {
              icon: '⚡',
              title: 'Cache & ISR',
              description:
                'Pages are cached and revalidated by webhook on publish, with a 5-minute ISR safety net. Fast and always fresh.',
            },
            {
              icon: '🗂',
              title: 'SEO + sitemap',
              description:
                'Per-page meta titles, descriptions and social images, plus a generated sitemap.xml and robots.txt.',
            },
            {
              icon: '🖼',
              title: 'S3 media',
              description:
                'Local filesystem uploads in dev; S3-compatible storage in deployment — switch by setting S3_* env vars.',
            },
            {
              icon: '🚀',
              title: 'One-command deploy',
              description:
                'Dockerfiles build from the repo root. Push to main on Rock8Cloud and both services redeploy automatically.',
            },
          ],
        },
        {
          __component: 'blocks.image-with-text',
          heading: 'Draft in private, publish in public',
          content: [
            'Open the **Content Manager** in the Strapi admin, edit the *Home*',
            'page and press **Preview**. You are seeing unpublished content',
            'rendered by the live frontend — no surprises at go-live.',
            '',
            'Publishing fires a webhook that clears the page cache instantly.',
          ].join('\n'),
          image: flowImage.id,
          imagePosition: 'right',
        },
        {
          __component: 'blocks.cta',
          heading: 'Take it to production.',
          text: 'PostgreSQL, S3 media and both services — deployed from one repository. Push to main and ship.',
          buttonLabel: 'Deploy on Rock8Cloud',
          buttonHref:
            'https://app.rock8.cloud/login?redirect=/new-deployment?blueprint=strapi-nextjs',
        },
      ],
    } as never,
    status: 'published',
  });

  strapi.log.info('Seeded the \"Home\" page (slug: home)');
  return homePage;
}

/**
 * Public URL of this Strapi instance — set PUBLIC_URL per deployment so
 * seeded links point at the right domain; falls back to localhost in dev.
 */
function getStrapiPublicUrl(strapi: Core.Strapi) {
  const url =
    strapi.config.get<string>('server.url') || 'http://localhost:1337';
  return url.replace(/\/+$/, '');
}

/**
 * Seed a default navbar on first start so the site header is populated
 * immediately with the same links the hardcoded header used to show.
 */
async function seedNavbar(strapi: Core.Strapi, homePageDocumentId: string) {
  const count = await strapi.documents('api::navbar.navbar').count({});
  if (count > 0) {
    return;
  }

  await strapi.documents('api::navbar.navbar').create({
    data: {
      items: [
        {
          label: 'Home',
          link: {
            type: 'page',
            label: 'Home',
            newTab: false,
            page: homePageDocumentId,
          },
        },
        {
          label: 'CMS Admin',
          link: {
            type: 'external',
            label: 'CMS Admin',
            href: `${getStrapiPublicUrl(strapi)}/admin`,
            newTab: false,
          },
        },
        {
          label: 'Rock8Cloud',
          link: {
            type: 'external',
            label: 'Rock8Cloud',
            href: 'https://rock8.cloud',
            newTab: true,
          },
        },
      ],
    } as never,
  });

  strapi.log.info('Seeded the default navbar');
}

/**
 * Seed a default footer on first start so the site footer is populated
 * immediately with links pointing at Strapi, Next.js and Rock8Cloud.
 */
async function seedFooter(strapi: Core.Strapi) {
  const count = await strapi.documents('api::footer.footer').count({});
  if (count > 0) {
    return;
  }

  await strapi.documents('api::footer.footer').create({
    data: {
      sections: [
        {
          title: 'Product',
          links: [
            {
              type: 'external',
              label: 'Rock8Cloud',
              href: 'https://rock8.cloud',
              newTab: true,
            },
            {
              type: 'external',
              label: 'Strapi',
              href: 'https://strapi.io',
              newTab: true,
            },
            {
              type: 'external',
              label: 'Next.js',
              href: 'https://nextjs.org',
              newTab: true,
            },
          ],
        },
        {
          title: 'Resources',
          links: [
            {
              type: 'external',
              label: 'Strapi Docs',
              href: 'https://docs.strapi.io',
              newTab: true,
            },
            {
              type: 'external',
              label: 'Next.js Docs',
              href: 'https://nextjs.org/docs',
              newTab: true,
            },
            {
              type: 'external',
              label: 'Turborepo',
              href: 'https://turborepo.dev',
              newTab: true,
            },
          ],
        },
      ],
      copyright: 'Built with Strapi + Next.js. Deployed on Rock8Cloud.',
    } as never,
  });

  strapi.log.info('Seeded the default footer');
}

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await grantPublicReadOnPages(strapi);
    const homePage = await seedHomePage(strapi);
    if (homePage) {
      await seedNavbar(strapi, homePage.documentId);
    }
    await seedFooter(strapi);
  },
};
