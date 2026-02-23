"use client";

import { ExternalLink } from "lucide-react";
import type { Tool } from "@/data/tools";

interface ToolsGridProps {
  tools: Tool[];
}

export function ToolsGrid({ tools }: ToolsGridProps) {
  if (tools.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-body text-white/40">No tools in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <a
          key={tool.name}
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card group rounded-xl p-5 transition-all"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-body text-base font-semibold text-white group-hover:text-[#00e87b] transition-colors">
                {tool.name}
              </h3>
              <p className="font-data mt-1 text-xs uppercase tracking-wider text-[#00e87b]/60">
                {tool.category}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-[#00e87b]" />
          </div>
          <p className="font-body mt-3 text-sm leading-relaxed text-white/50">
            {tool.description}
          </p>
        </a>
      ))}
    </div>
  );
}
