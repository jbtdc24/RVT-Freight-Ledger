import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  children?: ReactNode;
};

export function PageHeader({ title, children }: PageHeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between mb-2">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight font-headline bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/50">{title}</h1>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.1em]">{today}</p>
      </div>
      <div className="flex items-center space-x-2 mt-2 md:mt-0">{children}</div>
    </div>
  );
}
