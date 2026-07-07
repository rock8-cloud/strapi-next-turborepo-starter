import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

const HOME_SLUG = "home";
// Slugs are Strapi uid fields: lowercase letters, digits, hyphens (and
// slashes for nested paths). Rejecting anything else prevents open redirects.
const SLUG_PATTERN = /^[a-z0-9]+(?:[/-][a-z0-9]+)*$/;

/**
 * Called by the Strapi Preview button (see apps/strapi/config/admin.ts).
 * Enables Next.js Draft Mode so subsequent page requests fetch draft content.
 */
export async function GET(request: Request) {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret) {
    return new Response("Preview is not configured", { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== secret) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  const slug = searchParams.get("slug") ?? "";
  if (!SLUG_PATTERN.test(slug)) {
    return new Response("Invalid slug", { status: 400 });
  }

  const status = searchParams.get("status") === "published" ? "published" : "draft";

  const draft = await draftMode();
  if (status === "draft") {
    draft.enable();

    // The Strapi admin shows the preview in a cross-origin iframe. The draft
    // cookie is set with SameSite=Lax by default, which the browser drops in
    // that context — rewrite it as SameSite=None; Secure so preview works
    // inside the admin panel.
    const cookieStore = await cookies();
    const bypassCookie = cookieStore.get("__prerender_bypass");
    if (bypassCookie) {
      cookieStore.set("__prerender_bypass", bypassCookie.value, {
        path: "/",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
    }
  } else {
    draft.disable();
  }

  redirect(slug === HOME_SLUG ? "/" : `/${slug}`);
}
