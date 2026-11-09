import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong bg-surface px-6 py-10 text-center"
    >
      {icon ?? <SearchX className="h-10 w-10 text-ink-muted" aria-hidden="true" />}
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {description && <p className="mt-1 text-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
