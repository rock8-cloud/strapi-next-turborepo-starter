import type { Core } from '@strapi/strapi';

const allowedMediaTypes = [
  'image/*',
  'video/*',
  'audio/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.*',
  'text/plain',
  'text/csv',
];

const deniedExecutableTypes = [
  'application/vnd.microsoft.portable-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'application/x-executable',
  'application/x-dosexec',
  'application/x-sh',
  'text/x-shellscript',
  'application/x-mach-binary',
];

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => {
  // When S3_ENDPOINT is set (e.g. linked Rock8Cloud S3 Object Storage),
  // uploads go to S3-compatible storage. Otherwise files are stored on the
  // local filesystem (public/uploads) — the default for local development.
  const useS3 = Boolean(env('S3_ENDPOINT'));

  const uploadProvider = useS3
    ? {
        provider: 'aws-s3',
        providerOptions: {
          baseUrl: env('S3_PUBLIC_URL'),
          s3Options: {
            endpoint: env('S3_ENDPOINT'),
            // Path-style addressing is required by Rock8Cloud S3 storage
            // (and MinIO). Harmless for AWS S3 itself.
            forcePathStyle: env.bool('S3_FORCE_PATH_STYLE', true),
            region: env('S3_REGION', 'us-east-1'),
            credentials: {
              accessKeyId: env('S3_ACCESS_KEY'),
              secretAccessKey: env('S3_SECRET_KEY'),
            },
            params: {
              Bucket: env('S3_BUCKET'),
            },
          },
        },
      }
    : {};

  return {
    'users-permissions': {
      config: {
        jwtManagement: 'refresh',
        sessions: {
          httpOnly: true,
        },
      },
    },
    upload: {
      config: {
        ...uploadProvider,
        security: {
          allowedTypes: allowedMediaTypes,
          deniedTypes: deniedExecutableTypes,
        },
      },
    },
  };
};

export default config;
