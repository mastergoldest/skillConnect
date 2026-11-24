import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  count: string;
}

export default function CategoryCard({
  title,
  description,
  icon: Icon,
  count,
}: CategoryCardProps) {
  return (
    <button
      type="button"
      className="group flex w-full flex-col rounded-2xl border border-border bg-card p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon size={23} />
        </div>

        <ArrowUpRight
          size={19}
          className="text-muted-foreground transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>

      <h3 className="mt-6 font-heading text-lg font-bold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <span className="mt-5 text-xs font-semibold text-primary">
        {count}
      </span>
    </button>
  );
}