import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  if (!secret || secret !== process.env["CMS_PREVIEW_SECRET"])
    return new NextResponse("Unauthorised", { status: 401 });
  (await draftMode()).enable();
  const slug = searchParams.get("slug") ?? "";
  const collection = searchParams.get("collection") ?? "pages";
  const path = collection === "pages" ? `/${slug}` : `/${collection}/${slug}`;
  return NextResponse.redirect(
    new URL(path.replace(/\/$/, "") || "/", request.url),
  );
}
