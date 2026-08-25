import { RootPage, generatePageMetadata } from "@payloadcms/next/views";
import type { Metadata } from "next";

import configPromise from "@payload-config";
import { importMap } from "../importMap.js";

type SearchParams = Record<string, string | string[]>;

type PageArgs = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata(args: PageArgs): Promise<Metadata> {
  return generatePageMetadata({
    config: configPromise,
    params: args.params,
    searchParams: args.searchParams,
  });
}

export default function Root(args: PageArgs) {
  return RootPage({
    config: configPromise,
    importMap,
    params: args.params,
    searchParams: args.searchParams,
  });
}
