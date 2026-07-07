import { revalidateTag } from "next/cache";
import { STRAPI_CACHE_TAG } from "@/lib/strapi";

/**
 * Webhook target for Strapi (Settings → Webhooks). Configure it with:
 *   URL:    <this app>/api/revalidate
 *   Header: Authorization: bearer <REVALIDATE_SECRET>
 *   Events: entry.publish, entry.unpublish, entry.update, entry.delete
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ error: "Revalidation is not configured" }, { status: 404 });
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `bearer ${secret}` && authorization !== `Bearer ${secret}`) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  // Next 16 signature: the second argument is a cache-life profile.
  revalidateTag(STRAPI_CACHE_TAG, "max");
  return Response.json({ revalidated: true, now: Date.now() });
}
