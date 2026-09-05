import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return handleRevalidation(request);
}

export async function GET(request: Request) {
  return handleRevalidation(request);
}

async function handleRevalidation(request: Request) {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;

  const providedSecret = secretParam || bearerToken;
  const configuredSecret =
    process.env["CMS_REVALIDATE_SECRET"] || process.env["CMS_PREVIEW_SECRET"];

  if (
    !providedSecret ||
    (configuredSecret && providedSecret !== configuredSecret)
  ) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid revalidation secret" },
      { status: 401 },
    );
  }

  const path = url.searchParams.get("path");
  const tag = url.searchParams.get("tag");

  const results: { path?: string; tag?: string } = {};

  if (path) {
    revalidatePath(path);
    results.path = path;
  }

  if (tag) {
    const tagPathMap: Record<string, string> = {
      navigation: "/",
      pages: "/",
      products: "/products",
      services: "/services",
      industries: "/industries",
      resources: "/resources",
      projects: "/work",
      careers: "/careers",
      team: "/team",
    };
    const targetPath = tagPathMap[tag] ?? `/${tag}`;
    revalidatePath(targetPath, "layout");
    results.tag = tag;
  }

  // If neither specified, default to revalidating home layout
  if (!path && !tag) {
    revalidatePath("/", "layout");
    results.path = "/";
  }

  return NextResponse.json({
    revalidated: true,
    ...results,
    timestamp: Date.now(),
  });
}
