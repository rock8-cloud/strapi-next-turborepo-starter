import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/** Turns Draft Mode off and returns to the published site. */
export async function GET() {
  const draft = await draftMode();
  draft.disable();
  redirect("/");
}
