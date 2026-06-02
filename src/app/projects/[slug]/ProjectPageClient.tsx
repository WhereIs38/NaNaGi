"use client";

import { useEffect } from "react";

// Client component: notifies Agent of current project context
// Future: sends project context to the chat API for contextual responses
export default function ProjectPageClient({ slug }: { slug: string }) {
  useEffect(() => {
    // Store current project slug for Agent context
    // Phase 2: inject into chat API calls
    if (typeof window !== "undefined") {
      (window as unknown as Record<string, unknown>).__nanagiProject = slug;
    }
    return () => {
      if (typeof window !== "undefined") {
        delete (window as unknown as Record<string, unknown>).__nanagiProject;
      }
    };
  }, [slug]);

  return null; // no UI — chat widget is handled by PageShell
}
