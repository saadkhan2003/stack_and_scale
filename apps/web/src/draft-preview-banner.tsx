import Link from "next/link";
import { Eye, LogOut } from "lucide-react";

export function DraftPreviewBanner() {
  return (
    <aside
      aria-label="Draft Preview Controls"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#0a0a0c]/95 border border-amber-500/40 text-amber-200 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl text-xs font-medium animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Eye className="w-3.5 h-3.5 text-amber-400" />
        <span className="tracking-tight text-white/90">
          Draft Preview Mode Active
        </span>
        <span className="hidden sm:inline text-neutral-400">|</span>
        <span className="hidden sm:inline text-neutral-400">
          Viewing unpublished CMS drafts
        </span>
      </div>

      <Link
        href="/api/exit-preview"
        prefetch={false}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 hover:text-white border border-amber-500/40 transition-colors font-semibold shadow-sm ml-1"
      >
        <LogOut className="w-3 h-3" />
        <span>Exit Preview</span>
      </Link>
    </aside>
  );
}
